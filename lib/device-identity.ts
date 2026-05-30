import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "arsenal_puzzle_device_id";
const SESSION_KEY = "arsenal_puzzle_session";
const USER_KEY = "arsenal_puzzle_user";

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
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
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function createSessionToken(): string {
  const token = uuidv4();
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
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
