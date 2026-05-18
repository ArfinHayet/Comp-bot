import { getMe } from "@/lib/api";
import type { UserProfile } from "../entities/UserProfile";
import type { ProfileRepository } from "./ProfileRepository";

export class HttpProfileRepository implements ProfileRepository {
  getCurrentUser(): Promise<UserProfile> {
    return getMe();
  }
}
