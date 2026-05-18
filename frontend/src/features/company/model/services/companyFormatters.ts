import type { Company } from "../entities/Company";

export function formatCompanyDate(value: string) {
  return new Date(value).toLocaleString();
}

export function formatCompanyDateOnly(value: string) {
  return new Date(value).toLocaleDateString();
}

export function getActiveCompanyName(companies: Company[]) {
  return companies[0]?.name ?? "-";
}
