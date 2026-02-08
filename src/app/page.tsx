"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoans } from "@/hooks/useLoans";
import LoanForm from "@/components/LoanForm";
import LoanList from "@/components/LoanList";
import Calendar from "@/components/Calendar";
import type { Loan, LoanInput, User } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { loans, payments, loading, addLoan, editLoan, removeLoan, recordPayment, undoPayment } =
    useLoans();
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((res) => {
      if (res.status === 401) {
        router.push("/login");
        return null;
      }
      return res.json();
    }).then((data) => {
      if (data) setUser(data);
    });
  }, [router]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }, [router]);

  const handleSubmit = async (input: LoanInput) => {
    if (editingLoan) {
      await editLoan(editingLoan.id, input);
      setEditingLoan(null);
    } else {
      await addLoan(input);
    }
  };

  const handleDelete = async (id: number) => {
    await removeLoan(id);
    if (editingLoan?.id === id) setEditingLoan(null);
  };

  return (
    <div className="min-h-screen bg-gb-bg1">
      <header className="bg-gb-bg0 border-b border-gb-bg3">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gb-fg0">Loan Tracker</h1>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gb-fg3">{user.username}</span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-gb-bg3 px-3 py-1 text-sm text-gb-fg2 hover:bg-gb-bg1"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 p-4">
              <LoanForm
                key={editingLoan?.id ?? "new"}
                onSubmit={handleSubmit}
                editingLoan={editingLoan}
                onCancelEdit={() => setEditingLoan(null)}
              />
            </div>
            <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 p-4">
              {loading ? (
                <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
              ) : (
                <LoanList
                  loans={loans}
                  payments={payments}
                  onEdit={setEditingLoan}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-gb-bg0 rounded-lg border border-gb-bg3 p-4">
            <Calendar
              loans={loans}
              payments={payments}
              onRecordPayment={recordPayment}
              onUndoPayment={undoPayment}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
