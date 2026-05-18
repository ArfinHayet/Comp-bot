import { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "../model/entities/UserProfile";
import { createProfileService } from "../model/services/createProfileService";
import type { ProfileViewModel } from "./ProfileViewModel";

export function useProfileViewModel(): ProfileViewModel {
  const profileService = useMemo(() => createProfileService(), []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profileService
      .getCurrentUser()
      .then(setProfile)
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [profileService]);

  const joinedDate = profile
    ? new Date(profile.joinedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return { profile, loading, error, joinedDate };
}
