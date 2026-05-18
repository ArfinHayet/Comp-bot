import type { KnowledgeWebPage, RefetchedWebPage } from "../entities/KnowledgeWebPage";
import type { WebPageRepository } from "../repositories/WebPageRepository";

export class WebPageService {
  private readonly repository: WebPageRepository;

  constructor(repository: WebPageRepository) {
    this.repository = repository;
  }

  listWebPages(): Promise<KnowledgeWebPage[]> {
    return this.repository.list();
  }

  refetchWebPage(id: string): Promise<RefetchedWebPage> {
    return this.repository.refetch(id);
  }

  deleteWebPage(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
