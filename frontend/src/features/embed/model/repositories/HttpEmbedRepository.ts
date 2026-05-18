import { api } from "@/lib/api";
import type { AllowedDomain, WidgetKey } from "../entities/WidgetSettings";
import type { EmbedRepository } from "./EmbedRepository";

export class HttpEmbedRepository implements EmbedRepository {
  async listWidgetKeys(): Promise<WidgetKey[]> {
    const response = await api.get<WidgetKey[]>("/widget/keys");
    return response.data;
  }

  async createWidgetKey(label: string): Promise<WidgetKey> {
    const response = await api.post<WidgetKey>("/widget/keys", { label });
    return response.data;
  }

  async deleteWidgetKey(id: string): Promise<void> {
    await api.delete(`/widget/keys/${id}`);
  }

  async listAllowedDomains(): Promise<AllowedDomain[]> {
    const response = await api.get<AllowedDomain[]>("/widget/domains");
    return response.data;
  }

  async createAllowedDomain(domain: string): Promise<AllowedDomain> {
    const response = await api.post<AllowedDomain>("/widget/domains", { domain });
    return response.data;
  }

  async deleteAllowedDomain(id: string): Promise<void> {
    await api.delete(`/widget/domains/${id}`);
  }
}
