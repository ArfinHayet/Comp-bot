import { HttpAuthRepository } from "../repositories/HttpAuthRepository";
import { AuthService } from "./AuthService";

export function createAuthService() {
  return new AuthService(new HttpAuthRepository());
}
