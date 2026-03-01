"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SavingsAccount, SavingsInput } from "@/lib/types";
import { useImpersonation } from "@/lib/impersonation";

export function useSavings() {
  const router = useRouter();
  const { apiFetch } = useImpersonation();
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const handleResponse = useCallback(
    async (res: Response) => {
      if (res.status === 401) {
        router.push("/login");
        throw new Error("Unauthorized");
      }
      return res;
    },
    [router]
  );

  const fetchAll = useCallback(async () => {
    try {
      const res = await apiFetch("/api/savings").then(handleResponse);
      setAccounts(await res.json());
    } catch (e) {
      if (e instanceof Error && e.message === "Unauthorized") return;
      throw e;
    } finally {
      setLoading(false);
    }
  }, [handleResponse, apiFetch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addAccount = async (input: SavingsInput) => {
    const res = await apiFetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(handleResponse);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to create account");
    }
    await fetchAll();
  };

  const editAccount = async (id: number, input: SavingsInput) => {
    const res = await apiFetch(`/api/savings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(handleResponse);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to update account");
    }
    await fetchAll();
  };

  const removeAccount = async (id: number) => {
    await apiFetch(`/api/savings/${id}`, { method: "DELETE" }).then(handleResponse);
    await fetchAll();
  };

  return { accounts, loading, addAccount, editAccount, removeAccount };
}
