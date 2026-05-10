import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { createAgent } from 'langchain';
import { RetrievalService } from '../retrieval/retrieval.service';

/** History shape shared with ChatService */
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text?: string }[];
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly retrievalService: RetrievalService,
  ) {}

  /**
   * Agentic loop via LangGraph createReactAgent.
   * The LLM automatically decides when and how many times to call
   * search_documents — no manual functionCall inspection needed.
   */
  async runAgenticLoop(
    systemPrompt: string,
    history: GeminiMessage[],
    userMessage: string,
  ): Promise<string> {
    const apiKey = this.config.get<string>('google.apiKey')!;
    const maxIterations = this.config.get<number>('rag.maxToolIterations') ?? 5;

    // ── 1. Tool definition with Zod schema ───────────────────────────────────
    const searchDocumentsTool = tool(
      async ({ query }: { query: string }): Promise<string> => {
        this.logger.log(`Tool: search_documents("${query.slice(0, 80)}")`);
        return this.retrievalService.searchDocuments(query);
      },
      {
        name: 'search_documents',
        description:
          'Search the uploaded document knowledge base for content relevant to a query. ' +
          'Call this tool for EVERY factual question before answering. ' +
          'You may call it multiple times with different queries for complex questions. ' +
          'Returns the most relevant document excerpts.',
        schema: z.object({
          query: z.string().describe(
            'A focused natural-language search query. ' +
            'For multi-part questions, break into separate targeted queries ' +
            'and call the tool once per query.',
          ),
        }),
      },
    );

    // ── 2. LLM ────────────────────────────────────────────────────────────────
    const llm = new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemini-2.5-flash',
    });

    // ── 3. Convert stored history to LangChain messages ──────────────────────
    const chatHistory: BaseMessage[] = history.map((m) => {
      const text = m.parts.map((p) => p.text ?? '').join('');
      return m.role === 'user' ? new HumanMessage(text) : new AIMessage(text);
    });

    // ── 4. Agent — LangGraph handles the tool-call loop automatically ─────────
    const agent = createAgent({
      model: llm,
      tools: [searchDocumentsTool],
      systemPrompt: systemPrompt,
    });

    const result = await agent.invoke(
      {
        messages: [
          ...chatHistory,
          new HumanMessage(userMessage),
        ],
      },
      {
        recursionLimit: maxIterations * 2,  // LangGraph counts node visits, not LLM calls
      },
    );

    // Last message in the result is the final AI answer
    const lastMsg = result.messages.at(-1);
    const output = typeof lastMsg?.content === 'string'
      ? lastMsg.content
      : JSON.stringify(lastMsg?.content ?? '');

    if (!output) throw new Error('Agent returned empty output');
    return output;
  }

  /** Embed a text string using Gemini embedding-001 via REST */
  async embedText(text: string): Promise<number[]> {
    const apiKey = this.config.get<string>('google.apiKey');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
      },
    );
    return response.data.embedding.values as number[];
  }
}
