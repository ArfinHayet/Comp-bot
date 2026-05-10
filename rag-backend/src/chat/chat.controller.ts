import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';

class ChatRequestDto {
  'message': string;
  'sessionId': string;
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
