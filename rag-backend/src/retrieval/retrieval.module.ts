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
