import { useMemo } from "react";
import { createAuthService } from "../model/services/createAuthService";
import type { AuthSessionViewModel } from "./AuthSessionViewModel";

export function useAuthSessionViewModel(): AuthSessionViewModel {
  const authService = useMemo(() => createAuthService(), []);

  return {
    isAuthenticated: authService.isAuthenticated(),
  };
}
