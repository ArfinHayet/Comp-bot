import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ChatService } from '../chat/chat.service';
import { WidgetKeyGuard } from './widget-key.guard';
import type { WidgetRequest } from './widget-key.guard';

class WidgetChatDto {
  message!: string;
  sessionId!: string;
}

@Controller()
export class WidgetController {
  constructor(private readonly chatService: ChatService) {}

  /** Serve the embeddable widget JavaScript file */
  @Get('widget.js')
  serveScript(@Res() res: Response) {
    const scriptPath = path.join(__dirname, '..', 'public', 'widget.js');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(fs.readFileSync(scriptPath, 'utf-8'));
  }

  /**
   * Public chat endpoint for widget visitors.
   * :key is the public widget key (wk_xxx) embedded in the script tag.
   * WidgetKeyGuard validates the key, checks the origin whitelist,
   * and attaches the owner's userId to the request.
   */
  @Post('widget/:key/chat')
  @UseGuards(WidgetKeyGuard)
  async chat(
    @Param('key') key: string,
    @Body() body: WidgetChatDto,
    @Req() req: WidgetRequest,
  ) {
    if (!body.message?.trim()) throw new BadRequestException('message is required');
    if (!body.sessionId?.trim()) throw new BadRequestException('sessionId is required');

    // Namespace session to prevent collision with the owner's own chat sessions
    const scopedSessionId = `widget:${key}:${body.sessionId.trim()}`;
    return this.chatService.chat(body.message.trim(), scopedSessionId, req.widgetUserId);
  }
}
