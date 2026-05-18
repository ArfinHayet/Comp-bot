import { deleteWebPage, listWebPages, refetchWebPage } from "@/lib/api";
import type { KnowledgeWebPage, RefetchedWebPage } from "../entities/KnowledgeWebPage";
import type { WebPageRepository } from "./WebPageRepository";

export class HttpWebPageRepository implements WebPageRepository {
  list(): Promise<KnowledgeWebPage[]> {
    return listWebPages();
  }

  refetch(id: string): Promise<RefetchedWebPage> {
    return refetchWebPage(id);
  }

  async delete(id: string): Promise<void> {
    await deleteWebPage(id);
  }
}
