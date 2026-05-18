import { SupabaseAuthCallbackRepository } from "../repositories/SupabaseAuthCallbackRepository";
import { AuthCallbackService } from "./AuthCallbackService";

export function createAuthCallbackService() {
  return new AuthCallbackService(new SupabaseAuthCallbackRepository());
}
