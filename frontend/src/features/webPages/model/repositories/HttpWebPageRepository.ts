import { api } from "@/lib/api";
import type { KnowledgeWebPage, RefetchedWebPage } from "../entities/KnowledgeWebPage";
import type { WebPageRepository } from "./WebPageRepository";

export class HttpWebPageRepository implements WebPageRepository {
  async list(): Promise<KnowledgeWebPage[]> {
    const response = await api.get<KnowledgeWebPage[]>("/web-pages");
    return response.data;
  }

  async refetch(id: string): Promise<RefetchedWebPage> {
    const response = await api.post<RefetchedWebPage>(`/web-pages/${id}/refetch`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/web-pages/${id}`);
  }
}
