import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "arsenal_puzzle_device_id";
const USER_KEY = "arsenal_puzzle_user";

// Safari Lockdown Mode, strict private-browsing/ITP configurations, storage
// blocked by policy/extension, and some embedded webviews can throw on any
// localStorage access, not just return null. Falls back to an in-memory id
// for the lifetime of the tab so the app stays usable (just without
// persistence across reloads) instead of throwing uncaught in a render
// effect with no error boundary to catch it.
let inMemoryDeviceId: string | null = null;

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    if (!inMemoryDeviceId) inMemoryDeviceId = uuidv4();
    return inMemoryDeviceId;
  }
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Onboarding/XP updates just won't persist across reloads — the store
    // still holds the in-memory value for the rest of this session.
  }
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Nothing to clean up if storage was never writable in the first place.
  }
}

export interface StoredUser {
  id: string;
  device_id: string;
  username: string;
  xp: number;
  avatar_color: string;
  created_at: string;
}

const AVATAR_COLORS = [
  "#EF0107",
  "#063672",
  "#9C824A",
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#ec4899",
];

export function generateAvatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
