import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require('pdf-parse') as { PDFParse: new (opts: { data: Buffer }) => { getText(): Promise<{ text: string }> } };
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
      model: 'gemini-embedding-001',
    });
  }

  async ingestPdf(file: Express.Multer.File): Promise<{
    message: string;
    fileName: string;
    chunksCreated: number;
  }> {
    this.logger.log(`Ingesting: ${file.originalname}`);

    const parsed = await new PDFParse({ data: file.buffer }).getText();
    if (!parsed.text?.trim()) throw new Error('PDF contains no extractable text');

    // Strip null bytes (\x00) that PDF parsers embed for icons/special chars —
    // PostgreSQL UTF-8 encoding rejects them.
    const cleanText = parsed.text.replace(/\x00/g, '');

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.config.get<number>('rag.chunkSize'),
      chunkOverlap: this.config.get<number>('rag.chunkOverlap'),
    });
    const docs = await splitter.createDocuments([cleanText]);
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
