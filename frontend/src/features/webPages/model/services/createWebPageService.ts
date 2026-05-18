import { HttpWebPageRepository } from "../repositories/HttpWebPageRepository";
import { WebPageService } from "./WebPageService";

export function createWebPageService() {
  return new WebPageService(new HttpWebPageRepository());
}
