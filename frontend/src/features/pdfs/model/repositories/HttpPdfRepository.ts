import { deletePdf, listPdfs, renamePdf } from "@/lib/api";
import type { PdfDocument } from "../entities/PdfDocument";
import type { PdfRepository } from "./PdfRepository";

export class HttpPdfRepository implements PdfRepository {
  list(): Promise<PdfDocument[]> {
    return listPdfs();
  }

  rename(id: string, fileName: string): Promise<PdfDocument> {
    return renamePdf(id, fileName);
  }

  async delete(id: string): Promise<void> {
    await deletePdf(id);
  }
}
