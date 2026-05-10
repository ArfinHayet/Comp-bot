---
agent: agent
description: >
  Scaffold a complete NestJS RAG (Retrieval-Augmented Generation) backend with
  PDF knowledge base upload, semantic answer caching, and a grounded multi-turn
  chat API. Retrieval is LLM-driven via an MCP tool — the model decides when and
  how to search, preventing prompt injection via document chunks. Use this prompt
  when the user wants to generate, extend, or fix this NestJS + Supabase
  (pgvector) + LangChain + Gemini project.
---

# NestJS RAG PDF Chatbot — MCP Tool Retrieval

You are an expert NestJS engineer. Generate a complete, working backend project
following every instruction below. Write all files directly into the workspace.
Do not summarise or skip — create each file in full.

---

## Architecture Overview

```
POST /chat
  │
  ├─► Semantic cache check (pgvector cosine < 0.25) ──► return cached answer
  │
  └─► Embed question
        │
        └─► Gemini with search_documents MCP tool
              │
              ├─► Gemini decides to call search_documents(query)
              │     └─► RetrievalService queries pgvector
              │           └─► returns top-K chunks as tool result
              │
              ├─► Gemini may call search_documents again (different query)
              │
              └─► Gemini produces final answer from tool results
                    │
                    └─► Save to semantic cache + chat history
```

**Why MCP tool retrieval instead of classic RAG (stuffing chunks into system prompt):**

| Concern | Classic RAG | MCP Tool Retrieval |
|---|---|---|
| Prompt injection via PDF content | HIGH — chunks injected directly into system prompt | ELIMINATED — tool results come back as structured `tool_result` messages, never touching the system prompt |
| Multi-hop questions | One-shot retrieval, often misses | LLM issues multiple targeted searches |
| Retrieval control | Fixed top-K, always runs | LLM decides when, what, and how many times to search |
| Fallback when no docs found | Needs distance threshold guard | LLM reasons "tool returned nothing" and responds accordingly |

---

## Project Specification

### Two public REST endpoints (no auth)

| Method | Path            | Purpose                                           |
|--------|-----------------|---------------------------------------------------|
| POST   | `/admin/upload` | Upload a PDF → parse → chunk → embed → store     |
| POST   | `/chat`         | Send `{ message, sessionId }` → RAG answer        |

### Hard rules the AI must follow at runtime
- Answer **only** from `search_documents` tool results — never from training memory.
- If `search_documents` returns no relevant results, return the exact fallback string from the system prompt file.
- Chat is **multi-turn**: history per `sessionId` is loaded from DB on every request.
- All uploaded PDFs accumulate in the knowledge base (additive, no deletion).
- Response shape: `{ answer: string, cached: boolean }`.

### Semantic answer cache
- Before any LLM call, embed the user question and check `cached_answers` via cosine distance.
- Cache hit threshold: cosine distance **< 0.25** → return immediately, no LLM call.
- Cache miss → run agentic loop → save result to cache.
- Fallback answers are **never** cached.
- Cache is permanent — entries never expire.

### Tech stack
- **Framework**: NestJS (latest)
- **Database**: Supabase PostgreSQL via **Transaction Pooler URI**
- **Vector search**: pgvector (pre-enabled on Supabase)
- **ORM**: TypeORM (`synchronize: true` for dev)
- **Embeddings**: Google `text-embedding-004` via `@langchain/google-genai`
- **LLM**: `gemini-2.5-flash` via direct REST (needed for native function calling)
- **PDF parsing**: `pdf-parse`
- **Chunking**: LangChain `RecursiveCharacterTextSplitter`
- **System prompt**: loaded from `src/chat/prompts/system.prompt.txt` at runtime

---

## STEP 1 — Scaffold & Install

```bash
npx @nestjs/cli new rag-backend --package-manager npm --skip-git
cd rag-backend
```

Install all dependencies:

```bash
npm install \
  @nestjs/typeorm typeorm pg \
  @nestjs/config \
  @nestjs/platform-express \
  multer \
  langchain @langchain/core @langchain/google-genai \
  @google/generative-ai \
  axios \
  pdf-parse \
  uuid

npm install --save-dev \
  @types/multer \
  @types/pdf-parse \
  @types/uuid
```

> The `pgvector` npm package is **not** needed. pgvector is active on Supabase and
> we query it via raw SQL with inline `::vector` casts.

---

## STEP 2 — Environment Files

### `.env.example`

```env
# Supabase — copy from:
# Dashboard → Project Settings → Database → Connection string → Transaction pooler
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Google AI (https://aistudio.google.com/apikey)
GOOGLE_API_KEY=your_google_api_key_here

# App
PORT=3000

# RAG tuning
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RESULTS=5

# Agentic loop safety cap
MAX_TOOL_ITERATIONS=5
```

Create `.env` as a copy of `.env.example`. The user will fill in real values.

### `src/config/configuration.ts`

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
  rag: {
    chunkSize: parseInt(process.env.CHUNK_SIZE, 10) || 1000,
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP, 10) || 200,
    topK: parseInt(process.env.TOP_K_RESULTS, 10) || 5,
    maxToolIterations: parseInt(process.env.MAX_TOOL_ITERATIONS, 10) || 5,
  },
});
```

---

## STEP 3 — System Prompt File

### `src/chat/prompts/system.prompt.txt`

```
You are a helpful assistant that answers questions STRICTLY based on information retrieved via the search_documents tool.

RULES:
- You MUST call the search_documents tool before answering any factual question.
- Answer ONLY using information returned by search_documents — never use your own training knowledge.
- You MAY call search_documents multiple times with different queries if needed (e.g. multi-part questions).
- If search_documents returns no results or results that do not answer the question, respond with exactly this sentence and nothing else:
  I'm sorry, I don't have information about that in the available documents. Please ask a question related to the uploaded knowledge base.
- Never mention the tool by name in your answer — just answer naturally from the retrieved content.
- Be concise and accurate.
```

This file is the **single source of truth** for:
- The AI's behavioural rules and tool-use instructions
- The fallback message (the sentence after "respond with exactly this sentence and nothing else:")

`ChatService` loads it once at startup via `fs.readFileSync` and extracts the fallback
sentence by parsing the line immediately following the marker. Edit only this file to
change AI behaviour — no TypeScript changes needed.

---

## STEP 4 — MCP Tool Definition

### `src/retrieval/retrieval.tool.ts`

This file defines the `search_documents` tool schema that is sent to Gemini as a
function declaration. The LLM uses this to decide when and how to call the tool.

```typescript
/** Gemini function declaration for the document search tool. */
export const SEARCH_DOCUMENTS_TOOL = {
  name: 'search_documents',
  description:
    'Search the uploaded document knowledge base for content relevant to a query. ' +
    'Call this tool for EVERY factual question before answering. ' +
    'You may call it multiple times with different queries for complex questions. ' +
    'Returns the most relevant document excerpts.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'A focused natural-language search query. ' +
          'For multi-part questions, break into separate targeted queries and call the tool once per query.',
      },
    },
    required: ['query'],
  },
} as const;
```

**Why a separate file:** The tool definition is imported by both `RetrievalService`
(which executes it) and `GeminiService` (which passes it to the LLM). Keeping it in
its own file prevents circular dependency.

---

## STEP 5 — TypeORM Entities

### `src/document/document-chunk.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('document_chunks')
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  fileName: string;

  @Column({ type: 'int' })
  chunkIndex: number;

  /**
   * Float array stored as JSON text: "[0.12, -0.34, ...]".
   * Cast to ::vector inline in raw SQL queries.
   * TypeORM has no native vector column type — this avoids driver patching.
   */
  @Column({ type: 'text' })
  embedding: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### `src/chat/chat-message.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export type MessageRole = 'user' | 'assistant';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  sessionId: string;

  @Column({ type: 'varchar' })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### `src/cache/cached-answer.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cached_answers')
export class CachedAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  questionEmbedding: string;

  @Column({ type: 'text' })
  answer: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## STEP 6 — Document Module (PDF Ingestion)

### `src/document/document.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentChunk } from './document-chunk.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentChunk])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
```

### `src/document/document.controller.ts`

```typescript
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentService } from './document.service';

@Controller('admin')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.documentService.ingestPdf(file);
  }
}
```

### `src/document/document.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import * as pdfParse from 'pdf-parse';
import { DocumentChunk } from './document-chunk.entity';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly embeddings: GoogleGenerativeAIEmbeddings;

  constructor(
    @InjectRepository(DocumentChunk)
    private readonly chunkRepo: Repository<DocumentChunk>,
    private readonly config: ConfigService,
  ) {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: this.config.get<string>('google.apiKey'),
      model: 'text-embedding-004',
    });
  }

  async ingestPdf(file: Express.Multer.File): Promise<{
    message: string;
    fileName: string;
    chunksCreated: number;
  }> {
    this.logger.log(`Ingesting: ${file.originalname}`);

    const parsed = await pdfParse(file.buffer);
    if (!parsed.text?.trim()) throw new Error('PDF contains no extractable text');

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.config.get<number>('rag.chunkSize'),
      chunkOverlap: this.config.get<number>('rag.chunkOverlap'),
    });
    const docs = await splitter.createDocuments([parsed.text]);
    this.logger.log(`Split into ${docs.length} chunks`);

    const BATCH_SIZE = 10;
    const chunks: DocumentChunk[] = [];

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      const vectors = await this.embeddings.embedDocuments(
        batch.map((d) => d.pageContent),
      );
      for (let j = 0; j < batch.length; j++) {
        chunks.push(
          this.chunkRepo.create({
            content: batch[j].pageContent,
            fileName: file.originalname,
            chunkIndex: i + j,
            embedding: JSON.stringify(vectors[j]),
          }),
        );
      }
      this.logger.log(
        `Embedded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(docs.length / BATCH_SIZE)}`,
      );
    }

    await this.chunkRepo.save(chunks);
    return {
      message: 'PDF ingested successfully',
      fileName: file.originalname,
      chunksCreated: chunks.length,
    };
  }
}
```

---

## STEP 7 — Retrieval Service (MCP Tool Executor)

### `src/retrieval/retrieval.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentChunk } from '../document/document-chunk.entity';
import { RetrievalService } from './retrieval.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentChunk])],
  providers: [RetrievalService],
  exports: [RetrievalService],
})
export class RetrievalModule {}
```

### `src/retrieval/retrieval.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export interface RetrievedChunk {
  content: string;
  fileName: string;
  distance: number;
}

/** Cosine distance above which a chunk is considered irrelevant */
const DOC_THRESHOLD = 0.5;

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);
  private readonly embeddings: GoogleGenerativeAIEmbeddings;

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: this.config.get<string>('google.apiKey'),
      model: 'text-embedding-004',
    });
  }

  /**
   * MCP tool executor — called by GeminiService when the LLM issues a
   * search_documents function call.
   *
   * Embeds the query, runs pgvector cosine search, and returns relevant
   * chunks as a plain string. The result is sent back to Gemini as a
   * function_response message — it never touches the system prompt.
   */
  async searchDocuments(query: string): Promise<string> {
    this.logger.log(`Tool call: search_documents("${query.slice(0, 80)}")`);

    const queryVector = await this.embeddings.embedQuery(query);
    const topK = this.config.get<number>('rag.topK');

    const rows: { content: string; file_name: string; distance: string }[] =
      await this.dataSource.query(
        `SELECT content, "fileName" AS file_name,
                (embedding::vector <=> $1::vector) AS distance
         FROM document_chunks
         ORDER BY distance ASC
         LIMIT $2`,
        [JSON.stringify(queryVector), topK],
      );

    const relevant = rows.filter(
      (r) => parseFloat(r.distance) < DOC_THRESHOLD,
    );

    if (relevant.length === 0) {
      this.logger.log(`No relevant chunks found for: "${query}"`);
      return 'No relevant documents found for this query.';
    }

    // Format results as numbered excerpts — plain text, NOT injected into system prompt
    return relevant
      .map(
        (r, i) =>
          `[Excerpt ${i + 1} — ${r.file_name}]\n${r.content}`,
      )
      .join('\n\n');
  }
}
```

**Key design note:** `searchDocuments()` returns a plain string. This string goes
back to Gemini as a `function_response` message body — it is structurally isolated
from the system prompt and cannot override instructions, eliminating the chunk-based
prompt injection vector.

---

## STEP 8 — Gemini Service (Agentic Loop)

### `src/gemini/gemini.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { GeminiService } from './gemini.service';

@Module({
  imports: [RetrievalModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
```

### `src/gemini/gemini.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RetrievalService } from '../retrieval/retrieval.service';
import { SEARCH_DOCUMENTS_TOOL } from '../retrieval/retrieval.tool';

/** Gemini REST API message formats */
interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: { result: string } };
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly retrievalService: RetrievalService,
  ) {}

  /**
   * Agentic loop — runs until Gemini produces a final text answer or
   * the iteration cap is reached.
   *
   * Flow per iteration:
   *  1. POST to Gemini with current messages + tool definition
   *  2. If response contains functionCall parts → execute each tool →
   *     append results as user message with functionResponse parts → loop
   *  3. If response contains only text parts → return assembled answer
   */
  async runAgenticLoop(
    systemPrompt: string,
    history: GeminiMessage[],
    userMessage: string,
  ): Promise<string> {
    const apiKey = this.config.get<string>('google.apiKey');
    const maxIterations = this.config.get<number>('rag.maxToolIterations');

    // Build initial messages: history + current user turn
    const messages: GeminiMessage[] = [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      this.logger.log(`Agentic loop iteration ${iteration + 1}/${maxIterations}`);

      const response = await axios.post(
        `${GEMINI_API_BASE}:generateContent?key=${apiKey}`,
        {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages,
          tools: [{ function_declarations: [SEARCH_DOCUMENTS_TOOL] }],
          tool_config: { function_calling_config: { mode: 'AUTO' } },
        },
      );

      const candidate = response.data?.candidates?.[0];
      if (!candidate) throw new Error('Gemini returned no candidates');

      const parts: GeminiPart[] = candidate.content?.parts ?? [];

      // Append model turn to message history
      messages.push({ role: 'model', parts });

      // Check for function calls
      const functionCalls = parts.filter((p) => p.functionCall);

      if (functionCalls.length === 0) {
        // No tool calls — extract and return the final text answer
        const answer = parts
          .filter((p) => p.text)
          .map((p) => p.text!)
          .join('');
        if (!answer) throw new Error('Gemini returned empty text with no tool calls');
        return answer;
      }

      // Execute all tool calls and collect results as a single user message.
      // Each result is a functionResponse part — structurally separate from
      // the system prompt, so PDF content cannot override instructions.
      const resultParts: GeminiPart[] = [];

      for (const part of functionCalls) {
        const { name, args } = part.functionCall!;

        if (name === 'search_documents') {
          const result = await this.retrievalService.searchDocuments(
            args.query as string,
          );
          resultParts.push({
            functionResponse: {
              name,
              response: { result },
            },
          });
        } else {
          // Unknown tool — return error so the LLM can recover gracefully
          resultParts.push({
            functionResponse: {
              name,
              response: { result: `Unknown tool: ${name}` },
            },
          });
        }
      }

      // Append tool results as a user-role message and continue the loop
      messages.push({ role: 'user', parts: resultParts });
    }

    throw new Error(
      `Agentic loop reached max iterations (${maxIterations}) without a final answer`,
    );
  }

  /** Embed a text string using Gemini text-embedding-004 via REST */
  async embedText(text: string): Promise<number[]> {
    const apiKey = this.config.get<string>('google.apiKey');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
      },
    );
    return response.data.embedding.values as number[];
  }
}
```

---

## STEP 9 — Cache Module

### `src/cache/cache.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CachedAnswer } from './cached-answer.entity';
import { CacheService } from './cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([CachedAnswer])],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
```

### `src/cache/cache.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CachedAnswer } from './cached-answer.entity';

const CACHE_THRESHOLD = 0.25;

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @InjectRepository(CachedAnswer)
    private readonly cacheRepo: Repository<CachedAnswer>,
    private readonly dataSource: DataSource,
  ) {}

  async findHit(queryVector: number[]): Promise<string | null> {
    const rows: { answer: string; distance: string }[] =
      await this.dataSource.query(
        `SELECT answer, ("questionEmbedding"::vector <=> $1::vector) AS distance
         FROM cached_answers
         ORDER BY distance ASC
         LIMIT 1`,
        [JSON.stringify(queryVector)],
      );

    if (rows.length > 0 && parseFloat(rows[0].distance) < CACHE_THRESHOLD) {
      this.logger.log('Semantic cache hit');
      return rows[0].answer;
    }
    return null;
  }

  async save(
    question: string,
    questionVector: number[],
    answer: string,
  ): Promise<void> {
    await this.cacheRepo.save(
      this.cacheRepo.create({
        question,
        questionEmbedding: JSON.stringify(questionVector),
        answer,
      }),
    );
    this.logger.log(`Cached: "${question.slice(0, 60)}"`);
  }
}
```

---

## STEP 10 — Chat Module

### `src/chat/chat.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chat-message.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { GeminiModule } from '../gemini/gemini.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    GeminiModule,
    CacheModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
```

### `src/chat/chat.controller.ts`

```typescript
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';

class ChatRequestDto {
  message: string;
  sessionId: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatRequestDto) {
    if (!body.message?.trim()) throw new BadRequestException('message is required');
    if (!body.sessionId?.trim()) throw new BadRequestException('sessionId is required');
    return this.chatService.chat(body.message.trim(), body.sessionId.trim());
  }
}
```

### `src/chat/chat.service.ts`

```typescript
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

  private systemPrompt: string;
  private fallbackMessage: string;

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
```

---

## STEP 11 — Copy prompt file to dist on build

### `nest-cli.json` (update `compilerOptions`)

```json
{
  "compilerOptions": {
    "assets": [
      { "include": "chat/prompts/*.txt", "outDir": "./dist" }
    ],
    "watchAssets": true
  }
}
```

---

## STEP 12 — App Module & Bootstrap

### `src/app.module.ts`

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import configuration from './config/configuration';
import { DocumentChunk } from './document/document-chunk.entity';
import { ChatMessage } from './chat/chat-message.entity';
import { CachedAnswer } from './cache/cached-answer.entity';
import { DocumentModule } from './document/document.module';
import { ChatModule } from './chat/chat.module';
import { RetrievalModule } from './retrieval/retrieval.module';
import { GeminiModule } from './gemini/gemini.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('databaseUrl'),
        entities: [DocumentChunk, ChatMessage, CachedAnswer],
        synchronize: true,
        logging: false,
        extra: {
          options: '-c search_path=public',
          prepare: false,   // Required for Supabase Transaction Pooler (PgBouncer)
        },
        ssl: { rejectUnauthorized: false },
      }),
    }),
    DocumentModule,
    RetrievalModule,
    GeminiModule,
    CacheModule,
    ChatModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector;');
  }
}
```

### `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = app.get(ConfigService).get<number>('port') || 3000;
  await app.listen(port);

  console.log(`🚀  Server running on http://localhost:${port}`);
  console.log(`   POST /admin/upload  — ingest PDF into knowledge base`);
  console.log(`   POST /chat          — agentic RAG chat (MCP tool retrieval)`);
}
bootstrap();
```

---

## STEP 13 — README

### `README.md`

````markdown
# NestJS RAG PDF Chatbot (MCP Tool Retrieval)

A NestJS backend that lets an admin upload PDFs as a knowledge base and lets
users chat with an AI that answers **strictly** from those documents.

**Architecture highlight:** Document retrieval is LLM-driven via an MCP
`search_documents` tool. The model decides when and how to search, results
arrive as structured `function_response` messages (never in the system prompt),
eliminating prompt injection via PDF content.

## Stack
- NestJS + TypeORM
- Supabase (PostgreSQL + pgvector)
- Google `text-embedding-004` + `gemini-2.5-flash`
- LangChain (ingestion only), Axios (Gemini REST)

## Prerequisites
- Node.js 20+
- Supabase project (free tier works)
- Google AI API key (https://aistudio.google.com/apikey)

## Setup

### 1. Get your Supabase Transaction Pooler URI
Dashboard → Project Settings → Database → **Connection string** → Transaction pooler.

### 2. Configure environment
```bash
cp .env.example .env
# Fill in DATABASE_URL and GOOGLE_API_KEY
```

### 3. Install & run
```bash
npm install
npm run start:dev
```

Three tables are auto-created on first start:
`document_chunks`, `chat_messages`, `cached_answers`.

## API

### Upload a PDF
```bash
curl -X POST http://localhost:3000/admin/upload \
  -F "file=@document.pdf"
```
```json
{ "message": "PDF ingested successfully", "fileName": "document.pdf", "chunksCreated": 42 }
```

### Chat
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "What is the refund policy?", "sessionId": "user-abc" }'
```
```json
{ "answer": "According to the documents...", "cached": false }
```

On a semantically equivalent follow-up:
```json
{ "answer": "According to the documents...", "cached": true }
```

## How MCP tool retrieval works

1. User sends a question.
2. The question is embedded and checked against the semantic cache first.
3. On a cache miss, Gemini receives the system prompt, conversation history,
   and the `search_documents` tool definition.
4. Gemini decides to call `search_documents(query)` — once or multiple times
   for complex questions.
5. `RetrievalService` executes the pgvector query and returns matching chunks
   as a `function_response` message.
6. Gemini reads the tool results and produces a final answer.
7. The answer is saved to the semantic cache and chat history.

Document content **never enters the system prompt** — it cannot override
instructions or hijack behaviour.

## Semantic cache
Cosine distance **< 0.25** = cache hit → served instantly, no LLM call.
Cache is permanent. Fallback (no-answer) responses are never cached.

## Customising AI behaviour
Edit `src/chat/prompts/system.prompt.txt`. Controls rules, tone, and the fallback
message — no code change needed.

## Production checklist
- Set `synchronize: false`, switch to TypeORM migrations.
- Add `class-validator` to DTOs.
- Add `@nestjs/throttler` rate limiting on `/chat`.
- Monitor agentic loop iteration counts to tune `MAX_TOOL_ITERATIONS`.
````

---

## Output Checklist

Verify every file was created before finishing. If any is missing, create it now.

- [ ] `.env.example`
- [ ] `.env`
- [ ] `nest-cli.json` — updated with `assets` entry
- [ ] `src/config/configuration.ts`
- [ ] `src/chat/prompts/system.prompt.txt`
- [ ] `src/app.module.ts`
- [ ] `src/main.ts`
- [ ] `src/document/document-chunk.entity.ts`
- [ ] `src/document/document.service.ts`
- [ ] `src/document/document.controller.ts`
- [ ] `src/document/document.module.ts`
- [ ] `src/retrieval/retrieval.tool.ts`
- [ ] `src/retrieval/retrieval.service.ts`
- [ ] `src/retrieval/retrieval.module.ts`
- [ ] `src/gemini/gemini.service.ts`
- [ ] `src/gemini/gemini.module.ts`
- [ ] `src/cache/cached-answer.entity.ts`
- [ ] `src/cache/cache.service.ts`
- [ ] `src/cache/cache.module.ts`
- [ ] `src/chat/chat-message.entity.ts`
- [ ] `src/chat/chat.service.ts`
- [ ] `src/chat/chat.controller.ts`
- [ ] `src/chat/chat.module.ts`
- [ ] `README.md`