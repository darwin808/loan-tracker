"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Landmark, Receipt, TrendingUp, PiggyBank, Plus, LogOut } from "lucide-react";
import { useLoans } from "@/hooks/useLoans";
import { useBills } from "@/hooks/useBills";
import { useSavings } from "@/hooks/useSavings";
import { getPaymentSchedule } from "@/lib/payments";
import { getBillSchedule } from "@/lib/bill-schedule";
import LoanForm from "@/components/LoanForm";
import LoanList from "@/components/LoanList";
import BillForm from "@/components/BillForm";
import BillList from "@/components/BillList";
import SavingsForm from "@/components/SavingsForm";
import SavingsList from "@/components/SavingsList";
import Calendar from "@/components/Calendar";
import DonutChart from "@/components/DonutChart";
import type { Loan, LoanInput, Bill, BillInput, SavingsAccount, SavingsInput, User } from "@/lib/types";

type SidebarTab = "loans" | "bills" | "income" | "savings";
type AddModal = "loan" | "bill" | "income" | "savings" | null;

export default function Home() {
  const router = useRouter();
  const { loans, payments, loading, addLoan, editLoan, removeLoan, recordPayment, undoPayment } =
    useLoans();
  const { bills, billPayments, loading: billsLoading, addBill, editBill, removeBill, recordBillPayment, undoBillPayment } =
    useBills();
  const { accounts: savingsAccounts, loading: savingsLoading, addAccount, editAccount, removeAccount } =
    useSavings();
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingSavings, setEditingSavings] = useState<SavingsAccount | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("loans");
  const [showAddModal, setShowAddModal] = useState<AddModal>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  // Monthly summary for donut chart in sidebar — follows calendar month
  const monthSummary = useMemo(() => {
    const mStart = startOfMonth(currentMonth);
    const mEnd = endOfMonth(currentMonth);
    const startStr = format(mStart, "yyyy-MM-dd");
    const endStr = format(mEnd, "yyyy-MM-dd");
    const maxDate = new Date(currentMonth.getFullYear() + 1, 11, 31);

    let loanTotal = 0;
    let billTotal = 0;
    let incomeTotal = 0;

    loans.forEach((loan) => {
      const schedule = getPaymentSchedule(loan, payments);
      for (const entry of schedule) {
        if (entry.date >= startStr && entry.date <= endStr) {
          loanTotal += entry.scheduledAmount;
        }
      }
    });

    bills.forEach((bill) => {
      const schedule = getBillSchedule(bill, billPayments, maxDate);
      for (const entry of schedule) {
        if (entry.date >= startStr && entry.date <= endStr) {
          if (bill.type === "income") incomeTotal += entry.scheduledAmount;
          else billTotal += entry.scheduledAmount;
        }
      }
    });

    return { loanTotal, billTotal, incomeTotal };
  }, [loans, payments, bills, billPayments, currentMonth]);

  const hasChartData = monthSummary.loanTotal > 0 || monthSummary.billTotal > 0 || monthSummary.incomeTotal > 0;
  const totalSavings = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);

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
                className="rounded-md border border-gb-bg3 px-3 py-1 text-sm text-gb-fg2 hover:bg-gb-bg1 flex items-center gap-1.5"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            {/* Tab toggle */}
            <div className="flex rounded-lg border border-gb-bg3 overflow-hidden">
              <button
                onClick={() => setSidebarTab("loans")}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  sidebarTab === "loans"
                    ? "bg-gb-blue text-gb-bg0"
                    : "bg-gb-bg0 text-gb-fg3 hover:bg-gb-bg1"
                }`}
              >
                <Landmark size={14} />
                Loans
              </button>
              <button
                onClick={() => setSidebarTab("bills")}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  sidebarTab === "bills"
                    ? "bg-gb-orange text-gb-bg0"
                    : "bg-gb-bg0 text-gb-fg3 hover:bg-gb-bg1"
                }`}
              >
                <Receipt size={14} />
                Bills
              </button>
              <button
                onClick={() => setSidebarTab("income")}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  sidebarTab === "income"
                    ? "bg-gb-green text-gb-bg0"
                    : "bg-gb-bg0 text-gb-fg3 hover:bg-gb-bg1"
                }`}
              >
                <TrendingUp size={14} />
                Income
              </button>
              <button
                onClick={() => setSidebarTab("savings")}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  sidebarTab === "savings"
                    ? "bg-gb-purple text-gb-bg0"
                    : "bg-gb-bg0 text-gb-fg3 hover:bg-gb-bg1"
                }`}
              >
                <PiggyBank size={14} />
                Savings
              </button>
            </div>

            {/* Add button */}
            {sidebarTab === "loans" && (
              <button
                onClick={() => setShowAddModal("loan")}
                className="w-full rounded-lg border border-gb-blue/40 bg-gb-blue/10 px-4 py-2.5 text-sm font-medium text-gb-blue hover:bg-gb-blue/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                Add Loan
              </button>
            )}
            {sidebarTab === "bills" && (
              <button
                onClick={() => setShowAddModal("bill")}
                className="w-full rounded-lg border border-gb-orange/40 bg-gb-orange/10 px-4 py-2.5 text-sm font-medium text-gb-orange hover:bg-gb-orange/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                Add Bill
              </button>
            )}
            {sidebarTab === "income" && (
              <button
                onClick={() => setShowAddModal("income")}
                className="w-full rounded-lg border border-gb-green/40 bg-gb-green/10 px-4 py-2.5 text-sm font-medium text-gb-green hover:bg-gb-green/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                Add Income
              </button>
            )}
            {sidebarTab === "savings" && (
              <button
                onClick={() => setShowAddModal("savings")}
                className="w-full rounded-lg border border-gb-purple/40 bg-gb-purple/10 px-4 py-2.5 text-sm font-medium text-gb-purple hover:bg-gb-purple/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                Add Account
              </button>
            )}

            {/* Scrollable list */}
            {sidebarTab === "loans" && (
              <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 p-4 max-h-[400px] overflow-y-auto">
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
            )}
            {sidebarTab === "bills" && (
              <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 p-4 max-h-[400px] overflow-y-auto">
                {billsLoading ? (
                  <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
                ) : (
                  <BillList
                    bills={bills}
                    onEdit={setEditingBill}
                    onDelete={handleBillDelete}
                    filterType="expense"
                  />
                )}
              </div>
            )}
            {sidebarTab === "income" && (
              <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 p-4 max-h-[400px] overflow-y-auto">
                {billsLoading ? (
                  <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
                ) : (
                  <BillList
                    bills={bills}
                    onEdit={setEditingBill}
                    onDelete={handleBillDelete}
                    filterType="income"
                  />
                )}
              </div>
            )}
            {sidebarTab === "savings" && (
              <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 p-4 max-h-[400px] overflow-y-auto">
                {savingsLoading ? (
                  <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
                ) : (
                  <SavingsList
                    accounts={savingsAccounts}
                    onEdit={setEditingSavings}
                    onDelete={handleSavingsDelete}
                  />
                )}
              </div>
            )}

            {/* Donut chart — current month summary */}
            {hasChartData && (
              <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 p-4">
                <div className="text-xs font-medium text-gb-fg4 text-center mb-1">
                  {format(currentMonth, "MMMM yyyy")}
                </div>
                <DonutChart
                  loanTotal={monthSummary.loanTotal}
                  billTotal={monthSummary.billTotal}
                  incomeTotal={monthSummary.incomeTotal}
                  size={160}
                />
              </div>
            )}

            {/* Total savings summary */}
            {savingsAccounts.length > 0 && (
              <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gb-fg3 flex items-center gap-1.5">
                  <PiggyBank size={14} className="text-gb-purple" />
                  Total Savings
                </span>
                <span className="text-sm font-semibold text-gb-purple">
                  ₱{totalSavings.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-gb-bg0 rounded-lg border border-gb-bg3 p-4">
            <Calendar
              loans={loans}
              payments={payments}
              bills={bills}
              billPayments={billPayments}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onRecordPayment={recordPayment}
              onUndoPayment={undoPayment}
              onRecordBillPayment={recordBillPayment}
              onUndoBillPayment={undoBillPayment}
            />
          </div>
        </div>
      </main>

      {/* Add Loan Modal */}
      {showAddModal === "loan" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(null)}>
          <div className="absolute inset-0 bg-gb-fg0/30" />
          <div className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <LoanForm onSubmit={handleSubmit} />
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddModal === "bill" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(null)}>
          <div className="absolute inset-0 bg-gb-fg0/30" />
          <div className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <BillForm onSubmit={handleBillSubmit} defaultType="expense" />
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showAddModal === "income" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(null)}>
          <div className="absolute inset-0 bg-gb-fg0/30" />
          <div className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <BillForm onSubmit={handleBillSubmit} defaultType="income" />
          </div>
        </div>
      )}

      {/* Add Savings Modal */}
      {showAddModal === "savings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(null)}>
          <div className="absolute inset-0 bg-gb-fg0/30" />
          <div className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <SavingsForm onSubmit={handleSavingsSubmit} />
          </div>
        </div>
      )}

      {/* Edit Loan Modal */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setEditingLoan(null)}>
          <div className="absolute inset-0 bg-gb-fg0/30" />
          <div className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <LoanForm
              key={editingLoan.id}
              onSubmit={handleSubmit}
              editingLoan={editingLoan}
              onCancelEdit={() => setEditingLoan(null)}
            />
          </div>
        </div>
      )}

      {/* Edit Bill/Income Modal */}
      {editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setEditingBill(null)}>
          <div className="absolute inset-0 bg-gb-fg0/30" />
          <div className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg p-4 w-96" onClick={(e) => e.stopPropagation()}>
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

      {/* Edit Savings Modal */}
      {editingSavings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setEditingSavings(null)}>
          <div className="absolute inset-0 bg-gb-fg0/30" />
          <div className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <SavingsForm
              key={editingSavings.id}
              onSubmit={handleSavingsSubmit}
              editingAccount={editingSavings}
              onCancelEdit={() => setEditingSavings(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
