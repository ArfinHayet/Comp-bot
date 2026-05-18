export interface AuthCallbackSession {
  accessToken: string;
  refreshToken: string;
}

export interface AuthCallbackRepository {
  getSession(): Promise<AuthCallbackSession | null>;
  persistSession(session: AuthCallbackSession): void;
}
