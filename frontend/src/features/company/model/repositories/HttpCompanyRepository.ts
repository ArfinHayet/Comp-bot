import { api } from "@/lib/api";
import type { CompanyUpsertDto } from "../dto/CompanyUpsertDto";
import type { Company } from "../entities/Company";
import type { CompanyRepository } from "./CompanyRepository";

export class HttpCompanyRepository implements CompanyRepository {
  async list(): Promise<Company[]> {
    const response = await api.get<Company[]>("/company");
    return response.data;
  }

  async create(data: CompanyUpsertDto): Promise<Company> {
    const response = await api.post<Company>("/company", data);
    return response.data;
  }

  async update(id: string, data: Partial<CompanyUpsertDto>): Promise<Company> {
    const response = await api.patch<Company>(`/company/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/company/${id}`);
  }
}
