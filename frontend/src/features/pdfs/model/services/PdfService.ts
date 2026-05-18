import type { PdfDocument } from "../entities/PdfDocument";
import type { PdfRepository } from "../repositories/PdfRepository";

export class PdfService {
  private readonly repository: PdfRepository;

  constructor(repository: PdfRepository) {
    this.repository = repository;
  }

  listPdfs(): Promise<PdfDocument[]> {
    return this.repository.list();
  }

  renamePdf(id: string, fileName: string): Promise<PdfDocument> {
    return this.repository.rename(id, fileName.trim());
  }

  deletePdf(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
