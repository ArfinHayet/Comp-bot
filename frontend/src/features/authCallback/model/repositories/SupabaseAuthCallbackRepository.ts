import { setRefreshToken, setToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { AuthCallbackRepository, AuthCallbackSession } from "./AuthCallbackRepository";

export class SupabaseAuthCallbackRepository implements AuthCallbackRepository {
  async getSession(): Promise<AuthCallbackSession | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  persistSession(session: AuthCallbackSession): void {
    setToken(session.accessToken);
    setRefreshToken(session.refreshToken);
  }
}
