import type { CompanyUpsertDto } from "../dto/CompanyUpsertDto";
import type { Company } from "../entities/Company";

export interface CompanyRepository {
  list(): Promise<Company[]>;
  create(data: CompanyUpsertDto): Promise<Company>;
  update(id: string, data: Partial<CompanyUpsertDto>): Promise<Company>;
  delete(id: string): Promise<void>;
}
