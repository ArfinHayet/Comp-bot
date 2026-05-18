import { Loader2 } from "lucide-react";
import { GoogleIcon } from "./GoogleIcon";

interface GoogleSignInButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function GoogleSignInButton({ loading, disabled, onClick }: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-rm-trip-smooth border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-rm-trip-text shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
      {loading ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}
