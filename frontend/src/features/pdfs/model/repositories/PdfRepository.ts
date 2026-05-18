import type { PdfDocument } from "../entities/PdfDocument";

export interface PdfRepository {
  list(): Promise<PdfDocument[]>;
  rename(id: string, fileName: string): Promise<PdfDocument>;
  delete(id: string): Promise<void>;
}
