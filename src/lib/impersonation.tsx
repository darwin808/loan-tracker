"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

interface ImpersonationContextValue {
  impersonatingUserId: number | null;
  impersonatingUsername: string | null;
  setImpersonating: (userId: number | null, username?: string) => void;
  apiFetch: typeof fetch;
}

const ImpersonationContext = createContext<ImpersonationContextValue>({
  impersonatingUserId: null,
  impersonatingUsername: null,
  setImpersonating: () => {},
  apiFetch: fetch,
});

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [impersonatingUserId, setImpersonatingUserId] = useState<number | null>(null);
  const [impersonatingUsername, setImpersonatingUsername] = useState<string | null>(null);

  const setImpersonating = useCallback((userId: number | null, username?: string) => {
    setImpersonatingUserId(userId);
    setImpersonatingUsername(username ?? null);
  }, []);

  const apiFetch: typeof fetch = useMemo(() => {
    if (!impersonatingUserId) return fetch;
    const targetId = impersonatingUserId;
    return (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      headers.set("X-Impersonate-User", String(targetId));
      return fetch(input, { ...init, headers });
    };
  }, [impersonatingUserId]);

  return (
    <ImpersonationContext.Provider
      value={{ impersonatingUserId, impersonatingUsername, setImpersonating, apiFetch }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  return useContext(ImpersonationContext);
}
