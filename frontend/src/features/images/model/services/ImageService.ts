import type { KnowledgeImage } from "../entities/KnowledgeImage";
import type { ImageRepository } from "../repositories/ImageRepository";

export class ImageService {
  private readonly repository: ImageRepository;

  constructor(repository: ImageRepository) {
    this.repository = repository;
  }

  listImages(): Promise<KnowledgeImage[]> {
    return this.repository.list();
  }

  updateImage(id: string, data: { title: string; description: string }): Promise<KnowledgeImage> {
    return this.repository.update(id, {
      title: data.title.trim(),
      description: data.description.trim(),
    });
  }

  deleteImage(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
