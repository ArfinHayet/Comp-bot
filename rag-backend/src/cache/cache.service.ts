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
