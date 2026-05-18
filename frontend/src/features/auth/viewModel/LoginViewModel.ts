import type { AuthFieldErrors } from "../model/entities/AuthFieldErrors";
import type { AuthFormStatus } from "../model/entities/AuthFormStatus";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginViewModel {
  formData: LoginFormData;
  formStatus: AuthFormStatus;
  errors: AuthFieldErrors;
  googleLoading: boolean;
  setEmail(value: string): void;
  setPassword(value: string): void;
  submitLogin(): Promise<{ success: boolean; errorMessage?: string }>;
  signInWithGoogle(origin: string): Promise<{ success: boolean; errorMessage?: string }>;
}
