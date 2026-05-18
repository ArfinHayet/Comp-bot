import type { KnowledgeWebPage, RefetchedWebPage } from "../entities/KnowledgeWebPage";

export interface WebPageRepository {
  list(): Promise<KnowledgeWebPage[]>;
  refetch(id: string): Promise<RefetchedWebPage>;
  delete(id: string): Promise<void>;
}
