import type { CompanyUpsertDto } from "../dto/CompanyUpsertDto";
import type { Company } from "../entities/Company";
import type { CompanyRepository } from "../repositories/CompanyRepository";

export class CompanyService {
  private readonly companyRepository: CompanyRepository;

  constructor(companyRepository: CompanyRepository) {
    this.companyRepository = companyRepository;
  }

  listCompanies() {
    return this.companyRepository.list();
  }

  saveCompany(editTarget: Company | null, form: CompanyUpsertDto) {
    if (editTarget) {
      return this.companyRepository.update(editTarget.id, form);
    }

    return this.companyRepository.create(form);
  }

  deleteCompany(companyId: string) {
    return this.companyRepository.delete(companyId);
  }

  isValidForm(form: CompanyUpsertDto) {
    return Boolean(form.name.trim() && form.shortDescription.trim());
  }
}
