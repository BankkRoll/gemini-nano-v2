export type SessionUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type SessionData = {
  v: number;
  user: SessionUser;
  startedAt: number;
};

const SESSION_KEY = "nano:session";
const SESSION_VERSION = 1 as const;

function isClient(): boolean {
  return typeof window !== "undefined";
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getSession(): SessionData | null {
  if (!isClient()) return null;
  const raw = safeParse<SessionData>(sessionStorage.getItem(SESSION_KEY));
  if (!raw || raw.v !== SESSION_VERSION) return null;
  if (
    !raw.user ||
    typeof raw.user.id !== "string" ||
    typeof raw.user.name !== "string"
  ) {
    return null;
  }
  return raw;
}

export function startSession(user: SessionUser): SessionData {
  if (!isClient()) {
    return { v: SESSION_VERSION, user, startedAt: Date.now() };
  }
  const data: SessionData = {
    v: SESSION_VERSION,
    user,
    startedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
  return data;
}

export function endSession(): void {
  if (!isClient()) return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function getSignedInUser(): SessionUser | null {
  return getSession()?.user ?? null;
}

export function isSignedIn(): boolean {
  return !!getSignedInUser();
}
