import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createAuthCallbackService } from "../model/services/createAuthCallbackService";

export function useAuthCallbackViewModel() {
  const navigate = useNavigate();
  const handled = useRef(false);
  const authCallbackService = useMemo(() => createAuthCallbackService(), []);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    void (async () => {
      const completed = await authCallbackService.completeSignIn();
      if (!completed) {
        toast.error("Google sign-in failed. Please try again.");
        navigate("/login", { replace: true });
        return;
      }

      navigate("/chat", { replace: true });
    })();
  }, [authCallbackService, navigate]);
}
