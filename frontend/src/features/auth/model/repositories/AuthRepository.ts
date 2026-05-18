import type { LoginRequestDto } from "../dto/LoginRequestDto";
import type { SignupRequestDto } from "../dto/SignupRequestDto";

export interface AuthRepository {
  login(request: LoginRequestDto): Promise<void>;
  signup(request: SignupRequestDto): Promise<void>;
  signInWithGoogle(redirectTo: string): Promise<void>;
}
