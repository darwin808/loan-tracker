"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Landmark, Receipt, TrendingUp, PiggyBank, LogOut } from "lucide-react";
import { useLoans } from "@/hooks/useLoans";
import { useBills } from "@/hooks/useBills";
import { useSavings } from "@/hooks/useSavings";
import { getPaymentSchedule } from "@/lib/payments";
import { getBillSchedule } from "@/lib/bill-schedule";
import Calendar from "@/components/Calendar";
import DonutChart from "@/components/DonutChart";
import type { User } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { loans, payments, recordPayment, undoPayment } = useLoans();
  const { bills, billPayments, recordBillPayment, undoBillPayment } = useBills();
  const { accounts: savingsAccounts } = useSavings();
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
          <h1 className="text-xl font-bold text-gb-fg0">Dashboard</h1>
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

      {/* Summary Cards */}
      <div className="px-6 py-4 shrink-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Donut Chart (1/2) + Calendar (1/2) */}
      <div className="flex-1 min-h-0 px-6 pb-6">
        <div className="h-full grid grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="bg-gb-bg0 nb-card rounded-sm p-6 overflow-y-auto flex flex-col items-center justify-center">
            {hasChartData ? (
              <>
                <div className="text-sm font-medium text-gb-fg4 text-center mb-3">
                  {format(currentMonth, "MMMM yyyy")}
                </div>
                <DonutChart
                  loanTotal={monthSummary.loanTotal}
                  billTotal={monthSummary.billTotal}
                  incomeTotal={monthSummary.incomeTotal}
                  size={240}
                />
              </>
            ) : (
              <div className="text-sm text-gb-fg4 text-center">No data for this month</div>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-gb-bg0 nb-card rounded-sm p-6 overflow-y-auto">
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
      </div>
    </>
  );
}
