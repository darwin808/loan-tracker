"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, LogOut } from "lucide-react";
import { useLoans } from "@/hooks/useLoans";
import { useBills } from "@/hooks/useBills";
import { useSavings } from "@/hooks/useSavings";
import LoanForm from "@/components/LoanForm";
import LoanList from "@/components/LoanList";
import BillForm from "@/components/BillForm";
import BillList from "@/components/BillList";
import SavingsForm from "@/components/SavingsForm";
import SavingsList from "@/components/SavingsList";
import type { LoanInput, BillInput, SavingsInput, User, Loan, Bill, SavingsAccount } from "@/lib/types";

type ActiveSection = "loans" | "bills" | "income" | "savings";
type AddModal = "loan" | "bill" | "income" | "savings" | null;

const SECTION_CONFIG: Record<ActiveSection, { title: string; addLabel: string; addModal: AddModal; color: string }> = {
  loans: { title: "Loans", addLabel: "Add Loan", addModal: "loan", color: "bg-gb-blue" },
  bills: { title: "Bills", addLabel: "Add Bill", addModal: "bill", color: "bg-gb-orange" },
  income: { title: "Income", addLabel: "Add Income", addModal: "income", color: "bg-gb-green" },
  savings: { title: "Savings", addLabel: "Add Account", addModal: "savings", color: "bg-gb-purple" },
};

const VALID_SECTIONS = new Set<string>(["loans", "bills", "income", "savings"]);

export default function SectionPage() {
  const router = useRouter();
  const params = useParams();
  const section = (VALID_SECTIONS.has(params.section as string) ? params.section : "loans") as ActiveSection;
  const config = SECTION_CONFIG[section];

  const { loans, payments, loading, addLoan, editLoan, removeLoan } = useLoans();
  const { bills, loading: billsLoading, addBill, editBill, removeBill } = useBills();
  const { accounts: savingsAccounts, loading: savingsLoading, addAccount, editAccount, removeAccount } = useSavings();
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingSavings, setEditingSavings] = useState<SavingsAccount | null>(null);
  const [showAddModal, setShowAddModal] = useState<AddModal>(null);
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
    router.push("/");
  }, [router]);

  const handleSubmit = async (input: LoanInput) => {
    if (editingLoan) {
      await editLoan(editingLoan.id, input);
      setEditingLoan(null);
    } else {
      await addLoan(input);
      setShowAddModal(null);
    }
  };

  const handleDelete = async (id: number) => {
    await removeLoan(id);
    if (editingLoan?.id === id) setEditingLoan(null);
  };

  const handleBillSubmit = async (input: BillInput) => {
    if (editingBill) {
      await editBill(editingBill.id, input);
      setEditingBill(null);
    } else {
      await addBill(input);
      setShowAddModal(null);
    }
  };

  const handleBillDelete = async (id: number) => {
    await removeBill(id);
    if (editingBill?.id === id) setEditingBill(null);
  };

  const handleSavingsSubmit = async (input: SavingsInput) => {
    if (editingSavings) {
      await editAccount(editingSavings.id, input);
      setEditingSavings(null);
    } else {
      await addAccount(input);
      setShowAddModal(null);
    }
  };

  const handleSavingsDelete = async (id: number) => {
    await removeAccount(id);
    if (editingSavings?.id === id) setEditingSavings(null);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-gb-bg0 border-b-2 border-gb-fg0 shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gb-fg0">{config.title}</h1>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gb-fg3">{user.username}</span>
              <button
                onClick={handleLogout}
                className="nb-btn rounded-sm bg-gb-bg0 px-3 py-1 text-sm font-medium text-gb-fg2 hover:nb-btn-press flex items-center gap-1.5"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 min-h-0 px-8 py-6">
        <div className="h-full overflow-y-auto bg-gb-bg0 nb-card rounded-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gb-fg0">All {config.title}</h2>
            <button
              onClick={() => setShowAddModal(config.addModal)}
              className={`nb-btn rounded-sm ${config.color} px-4 py-2 text-sm font-bold text-gb-bg0 hover:nb-btn-press flex items-center gap-1.5`}
            >
              <Plus size={14} />
              {config.addLabel}
            </button>
          </div>

          {section === "loans" && (
            loading ? (
              <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
            ) : (
              <LoanList
                loans={loans}
                payments={payments}
                onEdit={setEditingLoan}
                onDelete={handleDelete}
              />
            )
          )}

          {section === "bills" && (
            billsLoading ? (
              <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
            ) : (
              <BillList
                bills={bills}
                onEdit={setEditingBill}
                onDelete={handleBillDelete}
                filterType="expense"
              />
            )
          )}

          {section === "income" && (
            billsLoading ? (
              <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
            ) : (
              <BillList
                bills={bills}
                onEdit={setEditingBill}
                onDelete={handleBillDelete}
                filterType="income"
              />
            )
          )}

          {section === "savings" && (
            savingsLoading ? (
              <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
            ) : (
              <SavingsList
                accounts={savingsAccounts}
                onEdit={setEditingSavings}
                onDelete={handleSavingsDelete}
              />
            )
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal === "loan" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(null)}>
          <div className="absolute inset-0 bg-gb-fg0/40" />
          <div className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <LoanForm onSubmit={handleSubmit} />
          </div>
        </div>
      )}

      {showAddModal === "bill" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(null)}>
          <div className="absolute inset-0 bg-gb-fg0/40" />
          <div className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <BillForm onSubmit={handleBillSubmit} defaultType="expense" />
          </div>
        </div>
      )}

      {showAddModal === "income" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(null)}>
          <div className="absolute inset-0 bg-gb-fg0/40" />
          <div className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <BillForm onSubmit={handleBillSubmit} defaultType="income" />
          </div>
        </div>
      )}

      {showAddModal === "savings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(null)}>
          <div className="absolute inset-0 bg-gb-fg0/40" />
          <div className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <SavingsForm onSubmit={handleSavingsSubmit} />
          </div>
        </div>
      )}

      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setEditingLoan(null)}>
          <div className="absolute inset-0 bg-gb-fg0/40" />
          <div className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <LoanForm
              key={editingLoan.id}
              onSubmit={handleSubmit}
              editingLoan={editingLoan}
              onCancelEdit={() => setEditingLoan(null)}
            />
          </div>
        </div>
      )}

      {editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setEditingBill(null)}>
          <div className="absolute inset-0 bg-gb-fg0/40" />
          <div className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <BillForm
              key={editingBill.id}
              onSubmit={handleBillSubmit}
              editingBill={editingBill}
              defaultType={editingBill.type}
              onCancelEdit={() => setEditingBill(null)}
            />
          </div>
        </div>
      )}

      {editingSavings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setEditingSavings(null)}>
          <div className="absolute inset-0 bg-gb-fg0/40" />
          <div className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <SavingsForm
              key={editingSavings.id}
              onSubmit={handleSavingsSubmit}
              editingAccount={editingSavings}
              onCancelEdit={() => setEditingSavings(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
