import {
  createAllowedDomain,
  createWidgetKey,
  deleteAllowedDomain,
  deleteWidgetKey,
  listAllowedDomains,
  listWidgetKeys,
} from "@/lib/api";
import type { AllowedDomain, WidgetKey } from "../entities/WidgetSettings";
import type { EmbedRepository } from "./EmbedRepository";

export class HttpEmbedRepository implements EmbedRepository {
  listWidgetKeys(): Promise<WidgetKey[]> {
    return listWidgetKeys();
  }

  createWidgetKey(label: string): Promise<WidgetKey> {
    return createWidgetKey(label);
  }

  async deleteWidgetKey(id: string): Promise<void> {
    await deleteWidgetKey(id);
  }

  listAllowedDomains(): Promise<AllowedDomain[]> {
    return listAllowedDomains();
  }

  createAllowedDomain(domain: string): Promise<AllowedDomain> {
    return createAllowedDomain(domain);
  }

  async deleteAllowedDomain(id: string): Promise<void> {
    await deleteAllowedDomain(id);
  }
}
