import type { KnowledgeImage } from "../entities/KnowledgeImage";

export interface ImageRepository {
  list(): Promise<KnowledgeImage[]>;
  update(id: string, data: { title: string; description: string }): Promise<KnowledgeImage>;
  delete(id: string): Promise<void>;
}
