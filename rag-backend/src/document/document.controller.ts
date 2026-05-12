import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { DocumentService } from './document.service';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('admin/upload')
  @UseGuards(JwtAuthGuard)
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
  async uploadPdf(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file provided');
    const userId = (req.user as { id: string }).id;
    return this.documentService.ingestPdf(file, userId);
  }

  @Get('pdfs')
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.documentService.findAllPdfs(userId);
  }

  @Get('pdfs/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.documentService.findOnePdf(id, userId);
  }

  @Patch('pdfs/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePdfDto, @Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.documentService.updatePdf(id, userId, dto);
  }

  @Delete('pdfs/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.documentService.deletePdf(id, userId);
  }
}
