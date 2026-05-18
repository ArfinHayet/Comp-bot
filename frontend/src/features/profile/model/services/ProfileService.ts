import type { UserProfile } from "../entities/UserProfile";
import type { ProfileRepository } from "../repositories/ProfileRepository";

export class ProfileService {
  private readonly repository: ProfileRepository;

  constructor(repository: ProfileRepository) {
    this.repository = repository;
  }

  getCurrentUser(): Promise<UserProfile> {
    return this.repository.getCurrentUser();
  }
}
