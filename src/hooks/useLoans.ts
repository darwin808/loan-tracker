"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Loan, LoanInput, Payment } from "@/lib/types";
import { useImpersonation } from "@/lib/impersonation";

export function useLoans() {
  const router = useRouter();
  const { apiFetch } = useImpersonation();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
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
      const [loansRes, paymentsRes] = await Promise.all([
        apiFetch("/api/loans").then(handleResponse),
        apiFetch("/api/payments").then(handleResponse),
      ]);
      setLoans(await loansRes.json());
      setPayments(await paymentsRes.json());
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

  const addLoan = async (input: LoanInput) => {
    const res = await apiFetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(handleResponse);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to create loan");
    }
    await fetchAll();
  };

  const editLoan = async (id: number, input: LoanInput) => {
    const res = await apiFetch(`/api/loans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(handleResponse);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to update loan");
    }
    await fetchAll();
  };

  const removeLoan = async (id: number) => {
    await apiFetch(`/api/loans/${id}`, { method: "DELETE" }).then(handleResponse);
    await fetchAll();
  };

  const recordPayment = async (loanId: number, date: string, amount: number) => {
    const res = await apiFetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanId, date, amount }),
    }).then(handleResponse);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to record payment");
    }
    await fetchAll();
  };

  const undoPayment = async (loanId: number, date: string) => {
    await apiFetch(`/api/payments?loanId=${loanId}&date=${date}`, { method: "DELETE" }).then(handleResponse);
    await fetchAll();
  };

  return { loans, payments, loading, addLoan, editLoan, removeLoan, recordPayment, undoPayment };
}
