"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Bill, BillInput, BillPayment } from "@/lib/types";

export function useBills() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
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
      const [billsRes, paymentsRes] = await Promise.all([
        fetch("/api/bills").then(handleResponse),
        fetch("/api/bill-payments").then(handleResponse),
      ]);
      setBills(await billsRes.json());
      setBillPayments(await paymentsRes.json());
    } catch (e) {
      if (e instanceof Error && e.message === "Unauthorized") return;
      throw e;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addBill = async (input: BillInput) => {
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(handleResponse);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to create bill");
    }
    await fetchAll();
  };

  const editBill = async (id: number, input: BillInput) => {
    const res = await fetch(`/api/bills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(handleResponse);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to update bill");
    }
    await fetchAll();
  };

  const removeBill = async (id: number) => {
    await fetch(`/api/bills/${id}`, { method: "DELETE" }).then(handleResponse);
    await fetchAll();
  };

  const recordBillPayment = async (billId: number, date: string, amount: number) => {
    const res = await fetch("/api/bill-payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billId, date, amount }),
    }).then(handleResponse);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(", ") ?? "Failed to record payment");
    }
    await fetchAll();
  };

  const undoBillPayment = async (billId: number, date: string) => {
    await fetch(`/api/bill-payments?billId=${billId}&date=${date}`, { method: "DELETE" }).then(handleResponse);
    await fetchAll();
  };

  return { bills, billPayments, loading, addBill, editBill, removeBill, recordBillPayment, undoBillPayment };
}
