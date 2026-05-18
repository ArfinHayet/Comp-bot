import { HttpCompanyRepository } from "../repositories/HttpCompanyRepository";
import { CompanyService } from "./CompanyService";

export function createCompanyService() {
  return new CompanyService(new HttpCompanyRepository());
}
