import {
  createCompany,
  deleteCompany,
  listCompanies,
  updateCompany,
} from "@/lib/api";
import type { CompanyUpsertDto } from "../dto/CompanyUpsertDto";
import type { Company } from "../entities/Company";
import type { CompanyRepository } from "./CompanyRepository";

export class HttpCompanyRepository implements CompanyRepository {
  async list(): Promise<Company[]> {
    return listCompanies();
  }

  async create(data: CompanyUpsertDto): Promise<Company> {
    return createCompany(data);
  }

  async update(id: string, data: Partial<CompanyUpsertDto>): Promise<Company> {
    return updateCompany(id, data);
  }

  async delete(id: string): Promise<void> {
    await deleteCompany(id);
  }
}
