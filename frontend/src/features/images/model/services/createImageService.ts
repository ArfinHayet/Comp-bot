import { HttpImageRepository } from "../repositories/HttpImageRepository";
import { ImageService } from "./ImageService";

export function createImageService() {
  return new ImageService(new HttpImageRepository());
}
