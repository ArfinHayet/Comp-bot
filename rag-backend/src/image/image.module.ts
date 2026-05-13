import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRecord } from './image.entity';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [TypeOrmModule.forFeature([ImageRecord]), GeminiModule],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
