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
