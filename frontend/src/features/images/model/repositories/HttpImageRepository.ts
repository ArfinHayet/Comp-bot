import { deleteImage, listImages, updateImage } from "@/lib/api";
import type { KnowledgeImage } from "../entities/KnowledgeImage";
import type { ImageRepository } from "./ImageRepository";

export class HttpImageRepository implements ImageRepository {
  list(): Promise<KnowledgeImage[]> {
    return listImages();
  }

  update(id: string, data: { title: string; description: string }): Promise<KnowledgeImage> {
    return updateImage(id, data);
  }

  async delete(id: string): Promise<void> {
    await deleteImage(id);
  }
}
