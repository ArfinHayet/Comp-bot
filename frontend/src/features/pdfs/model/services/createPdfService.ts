import { HttpPdfRepository } from "../repositories/HttpPdfRepository";
import { PdfService } from "./PdfService";

export function createPdfService() {
  return new PdfService(new HttpPdfRepository());
}
