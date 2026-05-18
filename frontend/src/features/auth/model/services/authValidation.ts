import type { AuthFieldErrors } from "../entities/AuthFieldErrors";

export function validateLoginForm(email: string, password: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  if (!email) errors.email = "Please provide a valid email.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

export function validateSignupForm(password: string, confirm: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  if (password.length < 6) errors.password = "Password must be at least 6 characters";
  if (password !== confirm) errors.confirm = "Passwords do not match";
  return errors;
}
