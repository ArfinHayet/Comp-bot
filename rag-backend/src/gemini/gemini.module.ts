import { Module } from '@nestjs/common';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { GeminiService } from './gemini.service';

@Module({
  imports: [RetrievalModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
