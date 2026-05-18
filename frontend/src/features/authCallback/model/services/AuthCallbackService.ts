import type { AuthCallbackRepository } from "../repositories/AuthCallbackRepository";

export class AuthCallbackService {
  private readonly repository: AuthCallbackRepository;

  constructor(repository: AuthCallbackRepository) {
    this.repository = repository;
  }

  async completeSignIn(): Promise<boolean> {
    const session = await this.repository.getSession();
    if (!session) return false;

    this.repository.persistSession(session);
    return true;
  }
}
