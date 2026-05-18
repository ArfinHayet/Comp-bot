import { api } from "@/lib/api";
import type { KnowledgeImage } from "../entities/KnowledgeImage";
import type { ImageRepository } from "./ImageRepository";

export class HttpImageRepository implements ImageRepository {
  async list(): Promise<KnowledgeImage[]> {
    const response = await api.get<KnowledgeImage[]>("/images");
    return response.data;
  }

  async update(id: string, data: { title: string; description: string }): Promise<KnowledgeImage> {
    const response = await api.patch<KnowledgeImage>(`/images/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/images/${id}`);
  }
}
