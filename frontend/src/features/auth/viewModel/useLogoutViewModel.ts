import { useMemo } from "react";
import { createAuthService } from "../model/services/createAuthService";
import type { LogoutViewModel } from "./LogoutViewModel";

export function useLogoutViewModel(): LogoutViewModel {
  const authService = useMemo(() => createAuthService(), []);

  return {
    logout: () => authService.logout(),
  };
}
