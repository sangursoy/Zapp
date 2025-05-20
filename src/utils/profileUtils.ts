import { Profile } from '../hooks/useProfile';

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;

  return Boolean(
    profile.username &&
    profile.first_name &&
    profile.last_name &&
    profile.username !== `user_${profile.id.substring(0, 8)}` &&
    profile.profile_completed
  );
}

export function getProfileDisplayName(profile: Profile | null): string {
  if (!profile) return 'User';
  return `${profile.first_name} ${profile.last_name}`;
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}