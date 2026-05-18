import { HttpEmbedRepository } from "../repositories/HttpEmbedRepository";
import { EmbedService } from "./EmbedService";

export function createEmbedService() {
  return new EmbedService(new HttpEmbedRepository());
}
