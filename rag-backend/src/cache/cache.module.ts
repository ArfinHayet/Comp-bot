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
