import { HttpUploadRepository } from "../repositories/HttpUploadRepository";
import { UploadService } from "./UploadService";

export function createUploadService() {
  return new UploadService(new HttpUploadRepository());
}
