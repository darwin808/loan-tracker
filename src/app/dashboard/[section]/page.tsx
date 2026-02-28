"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
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
import type { LoanInput, BillInput, SavingsInput, User, Loan, Bill, SavingsAccount } from "@/lib/types";

type ActiveSection = "loans" | "bills" | "income" | "savings" | "calendar";
type AddModal = "loan" | "bill" | "income" | "savings" | null;

const SECTION_TITLES: Record<ActiveSection, string> = {
  loans: "Loans",
  bills: "Bills",
  income: "Income",
  savings: "Savings",
  calendar: "Calendar",
};

const VALID_SECTIONS = new Set<string>(["loans", "bills", "income", "savings", "calendar"]);

export default function SectionPage() {
  const router = useRouter();
  const params = useParams();
  const section = (VALID_SECTIONS.has(params.section as string) ? params.section : "loans") as ActiveSection;

  const { loans, payments, loading, addLoan, editLoan, removeLoan, recordPayment, undoPayment } =
    useLoans();
  const { bills, billPayments, loading: billsLoading, addBill, editBill, removeBill, recordBillPayment, undoBillPayment } =
    useBills();
  const { accounts: savingsAccounts, loading: savingsLoading, addAccount, editAccount, removeAccount } =
    useSavings();
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingSavings, setEditingSavings] = useState<SavingsAccount | null>(null);
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

  // Monthly summary — follows calendar month
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

  const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalSavings = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  const netThisMonth = monthSummary.incomeTotal - monthSummary.loanTotal - monthSummary.billTotal;
  const hasChartData = monthSummary.loanTotal > 0 || monthSummary.billTotal > 0 || monthSummary.incomeTotal > 0;

  return (
    <>
      {/* Header */}
      <header className="bg-gb-bg0 border-b-2 border-gb-fg0 shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gb-fg0">{SECTION_TITLES[section]}</h1>
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

      {/* Summary Cards + Donut Chart */}
      <div className="px-6 py-4 shrink-0">
        <div className="flex gap-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            <div className="nb-card-sm rounded-sm bg-gb-bg0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gb-blue p-1.5 rounded-sm">
                  <Landmark size={16} className="text-gb-bg0" />
                </div>
                <span className="text-xs font-bold text-gb-fg4 uppercase tracking-wide">Total Loans</span>
              </div>
              <div className="text-2xl font-bold text-gb-blue-dim">
                ${totalLoans.toLocaleString()}
              </div>
            </div>

            <div className="nb-card-sm rounded-sm bg-gb-bg0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gb-orange p-1.5 rounded-sm">
                  <Receipt size={16} className="text-gb-bg0" />
                </div>
                <span className="text-xs font-bold text-gb-fg4 uppercase tracking-wide">Bills This Month</span>
              </div>
              <div className="text-2xl font-bold text-gb-orange-dim">
                ${monthSummary.billTotal.toLocaleString()}
              </div>
            </div>

            <div className="nb-card-sm rounded-sm bg-gb-bg0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gb-purple p-1.5 rounded-sm">
                  <PiggyBank size={16} className="text-gb-bg0" />
                </div>
                <span className="text-xs font-bold text-gb-fg4 uppercase tracking-wide">Total Savings</span>
              </div>
              <div className="text-2xl font-bold text-gb-purple-dim">
                ${totalSavings.toLocaleString()}
              </div>
            </div>

            <div className="nb-card-sm rounded-sm bg-gb-bg0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`${netThisMonth >= 0 ? "bg-gb-green" : "bg-gb-red"} p-1.5 rounded-sm`}>
                  <TrendingUp size={16} className="text-gb-bg0" />
                </div>
                <span className="text-xs font-bold text-gb-fg4 uppercase tracking-wide">Net This Month</span>
              </div>
              <div className={`text-2xl font-bold ${netThisMonth >= 0 ? "text-gb-green-dim" : "text-gb-red-dim"}`}>
                {netThisMonth >= 0 ? "+" : ""}${netThisMonth.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          {hasChartData && (
            <div className="nb-card-sm rounded-sm bg-gb-bg0 p-4 shrink-0 flex flex-col items-center justify-center">
              <div className="text-xs font-medium text-gb-fg4 text-center mb-1">
                {format(currentMonth, "MMM yyyy")}
              </div>
              <DonutChart
                loanTotal={monthSummary.loanTotal}
                billTotal={monthSummary.billTotal}
                incomeTotal={monthSummary.incomeTotal}
                size={100}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 px-6 pb-6">
        <div className="h-full overflow-y-auto bg-gb-bg0 nb-card rounded-sm p-6">
          {section === "loans" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gb-fg0">All Loans</h2>
                <button
                  onClick={() => setShowAddModal("loan")}
                  className="nb-btn rounded-sm bg-gb-blue px-4 py-2 text-sm font-bold text-gb-bg0 hover:nb-btn-press flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Add Loan
                </button>
              </div>
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
            </>
          )}

          {section === "bills" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gb-fg0">All Bills</h2>
                <button
                  onClick={() => setShowAddModal("bill")}
                  className="nb-btn rounded-sm bg-gb-orange px-4 py-2 text-sm font-bold text-gb-bg0 hover:nb-btn-press flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Add Bill
                </button>
              </div>
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
            </>
          )}

          {section === "income" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gb-fg0">All Income</h2>
                <button
                  onClick={() => setShowAddModal("income")}
                  className="nb-btn rounded-sm bg-gb-green px-4 py-2 text-sm font-bold text-gb-bg0 hover:nb-btn-press flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Add Income
                </button>
              </div>
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
            </>
          )}

          {section === "savings" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gb-fg0">All Savings</h2>
                <button
                  onClick={() => setShowAddModal("savings")}
                  className="nb-btn rounded-sm bg-gb-purple px-4 py-2 text-sm font-bold text-gb-bg0 hover:nb-btn-press flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Add Account
                </button>
              </div>
              {savingsLoading ? (
                <div className="text-sm text-gb-fg4 text-center py-8">Loading...</div>
              ) : (
                <SavingsList
                  accounts={savingsAccounts}
                  onEdit={setEditingSavings}
                  onDelete={handleSavingsDelete}
                />
              )}
            </>
          )}

          {section === "calendar" && (
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
