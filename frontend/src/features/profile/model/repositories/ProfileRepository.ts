import type { UserProfile } from "../entities/UserProfile";

export interface ProfileRepository {
  getCurrentUser(): Promise<UserProfile>;
}
