import { analyzeImage, ingestUrlsStream, saveImage, uploadPdf } from "@/lib/api";
import type {
  ImageAnalysisResult,
  ImageUploadResult,
  IngestUrlsResponse,
  IngestUrlsStreamEvent,
  PdfUploadResult,
} from "../entities/UploadResults";
import type { UploadRepository } from "./UploadRepository";

export class HttpUploadRepository implements UploadRepository {
  async uploadPdf(file: File, onProgress?: (pct: number) => void): Promise<PdfUploadResult> {
    const response = await uploadPdf(file, onProgress);
    return response.data;
  }

  ingestUrlsStream(urls: string[], onEvent: (event: IngestUrlsStreamEvent) => void): Promise<IngestUrlsResponse> {
    return ingestUrlsStream(urls, onEvent);
  }

  analyzeImage(base64: string, mimeType: string): Promise<ImageAnalysisResult> {
    return analyzeImage(base64, mimeType);
  }

  saveImage(file: File, title: string, description: string): Promise<ImageUploadResult> {
    return saveImage(file, title, description);
  }
}
