"use client";

import { useState, useEffect, useCallback } from "react";
import type { Loan, LoanInput, Payment } from "@/lib/types";

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [loansRes, paymentsRes] = await Promise.all([
      fetch("/api/loans"),
      fetch("/api/payments"),
    ]);
    setLoans(await loansRes.json());
    setPayments(await paymentsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addLoan = async (input: LoanInput) => {
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to create loan");
    }
    await fetchAll();
  };

  const editLoan = async (id: number, input: LoanInput) => {
    const res = await fetch(`/api/loans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to update loan");
    }
    await fetchAll();
  };

  const removeLoan = async (id: number) => {
    await fetch(`/api/loans/${id}`, { method: "DELETE" });
    await fetchAll();
  };

  const recordPayment = async (loanId: number, date: string, amount: number) => {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanId, date, amount }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to record payment");
    }
    await fetchAll();
  };

  const undoPayment = async (loanId: number, date: string) => {
    await fetch(`/api/payments?loanId=${loanId}&date=${date}`, { method: "DELETE" });
    await fetchAll();
  };

  return { loans, payments, loading, addLoan, editLoan, removeLoan, recordPayment, undoPayment };
}
