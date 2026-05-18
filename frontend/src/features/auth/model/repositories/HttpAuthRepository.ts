import { login, signup } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { LoginRequestDto } from "../dto/LoginRequestDto";
import type { SignupRequestDto } from "../dto/SignupRequestDto";
import type { AuthRepository } from "./AuthRepository";

export class HttpAuthRepository implements AuthRepository {
  async login(request: LoginRequestDto): Promise<void> {
    await login(request.email, request.password);
  }

  async signup(request: SignupRequestDto): Promise<void> {
    await signup(request.email, request.password);
  }

  async signInWithGoogle(redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
