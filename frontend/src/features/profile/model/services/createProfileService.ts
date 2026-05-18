import { HttpProfileRepository } from "../repositories/HttpProfileRepository";
import { ProfileService } from "./ProfileService";

export function createProfileService() {
  return new ProfileService(new HttpProfileRepository());
}
