import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { ChatMessage } from './chat-message.entity';
import { GeminiService } from '../gemini/gemini.service';
import { CacheService } from '../cache/cache.service';

/** Max stored messages loaded per session (10 full turns) */
const MAX_HISTORY = 20;

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);

  private systemPrompt: string = '';
  private fallbackMessage: string = '';

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
    private readonly config: ConfigService,
    private readonly geminiService: GeminiService,
    private readonly cacheService: CacheService,
  ) {}

  onModuleInit() {
    const promptPath = path.join(__dirname, 'prompts', 'system.prompt.txt');
    this.systemPrompt = fs.readFileSync(promptPath, 'utf-8');

    // Extract fallback sentence from the prompt file so it stays in sync
    const lines = this.systemPrompt.split('\n');
    const markerIdx = lines.findIndex((l) =>
      l.includes('respond with exactly this sentence'),
    );
    this.fallbackMessage =
      markerIdx !== -1 && lines[markerIdx + 1]
        ? lines[markerIdx + 1].trim()
        : "I'm sorry, I don't have information about that in the available documents.";

    this.logger.log('System prompt loaded');
  }

  async chat(
    message: string,
    sessionId: string,
  ): Promise<{ answer: string; cached: boolean }> {

    // ── 1. Embed question (needed for cache lookup) ──────────────────────────
    const queryVector = await this.geminiService.embedText(message);

    // ── 2. Semantic cache check ──────────────────────────────────────────────
    const cachedAnswer = await this.cacheService.findHit(queryVector);
    if (cachedAnswer) {
      await this.saveTurn(sessionId, message, cachedAnswer);
      return { answer: cachedAnswer, cached: true };
    }

    // ── 3. Load conversation history ─────────────────────────────────────────
    const history = await this.loadHistory(sessionId);

    // ── 4. Run agentic loop — LLM decides when/what to retrieve ─────────────
    //
    // The LLM receives:
    //   - system prompt (behavioural rules + tool-use instructions)
    //   - conversation history
    //   - current user message
    //   - search_documents tool definition
    //
    // It then issues function calls which GeminiService executes and returns
    // as functionResponse messages — document content NEVER enters the system
    // prompt, so it cannot override instructions (no prompt injection).
    let answer: string;
    try {
      answer = await this.geminiService.runAgenticLoop(
        this.systemPrompt,
        history,
        message,
      );
    } catch (err) {
      this.logger.error('Agentic loop failed', err);
      answer = this.fallbackMessage;
    }

    // ── 5. Detect fallback — do not cache non-answers ────────────────────────
    const isFallback = answer.trim() === this.fallbackMessage.trim();

    // ── 6. Persist turn + cache (in parallel, only if non-fallback) ─────────
    const tasks: Promise<unknown>[] = [
      this.saveTurn(sessionId, message, answer),
    ];
    if (!isFallback) {
      tasks.push(this.cacheService.save(message, queryVector, answer));
    }
    await Promise.all(tasks);

    return { answer, cached: false };
  }

  private async loadHistory(sessionId: string) {
    const msgs = await this.chatRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      take: MAX_HISTORY,
    });
    // Map to Gemini message format
    return msgs.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.content }],
    }));
  }

  private async saveTurn(
    sessionId: string,
    userMsg: string,
    aiMsg: string,
  ): Promise<void> {
    await this.chatRepo.save([
      this.chatRepo.create({ sessionId, role: 'user', content: userMsg }),
      this.chatRepo.create({ sessionId, role: 'assistant', content: aiMsg }),
    ]);
  }
}
