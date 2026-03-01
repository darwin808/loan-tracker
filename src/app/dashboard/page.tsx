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
import Skeleton from "@/components/Skeleton";
import type { User } from "@/lib/types";
import { useCurrency } from "@/lib/currency";

export default function DashboardPage() {
  const router = useRouter();
  const { loans, payments, loading: loansLoading, recordPayment, undoPayment } = useLoans();
  const { bills, billPayments, loading: billsLoading, recordBillPayment, undoBillPayment } = useBills();
  const { accounts: savingsAccounts, loading: savingsLoading } = useSavings();
  const dataLoading = loansLoading || billsLoading || savingsLoading;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { fmt } = useCurrency();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-gb-fg0">Dashboard</h1>
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

      {/* Content — scrolls as one unit on mobile, constrained on desktop */}
      <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden md:flex md:flex-col">
        {/* Summary Cards */}
        <div className="px-4 md:px-6 py-3 md:py-4 md:shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {dataLoading ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="nb-card-sm rounded-sm bg-gb-bg0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="w-[28px] h-[28px]" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-28" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="nb-card-sm rounded-sm bg-gb-bg0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gb-blue p-1.5 rounded-sm">
                      <Landmark size={16} className="text-gb-bg0" />
                    </div>
                    <span className="text-xs font-bold text-gb-fg4 uppercase tracking-wide">Loans This Month</span>
                  </div>
                  <div className="text-2xl font-bold text-gb-blue-dim">
                    {fmt(monthSummary.loanTotal)}
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
                    {fmt(monthSummary.billTotal)}
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
                    {fmt(totalSavings)}
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
                    {netThisMonth >= 0 ? "+" : ""}{fmt(netThisMonth)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Donut Chart + Calendar */}
        <div className="px-4 md:px-6 pb-4 md:pb-6 md:flex-1 md:min-h-0">
          <div className="md:h-full flex flex-col lg:grid lg:grid-cols-3 gap-3 md:gap-6">
            {dataLoading ? (
              <>
                {/* Donut Chart Skeleton */}
                <div className="bg-gb-bg0 nb-card rounded-sm p-3 md:p-6 shrink-0 lg:shrink lg:overflow-y-auto flex flex-col items-center justify-center">
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="w-[140px] h-[140px] md:w-[240px] md:h-[240px] !rounded-full" />
                  <div className="flex gap-4 mt-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>

                {/* Calendar Skeleton */}
                <div className="lg:col-span-2 bg-gb-bg0 nb-card rounded-sm p-3 md:p-6 md:flex-1 md:min-h-0 md:overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(7)].map((_, i) => (
                      <Skeleton key={`dh-${i}`} className="h-4 w-full mb-1" />
                    ))}
                    {[...Array(35)].map((_, i) => (
                      <Skeleton key={`dc-${i}`} className="h-10 md:h-16 w-full" />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Donut Chart */}
                {hasChartData && (
                  <div className="bg-gb-bg0 nb-card rounded-sm p-3 md:p-6 shrink-0 lg:shrink lg:overflow-y-auto flex flex-col items-center justify-center">
                    <div className="text-xs md:text-sm font-medium text-gb-fg4 text-center mb-1 md:mb-3">
                      {format(currentMonth, "MMMM yyyy")}
                    </div>
                    <DonutChart
                      loanTotal={monthSummary.loanTotal}
                      billTotal={monthSummary.billTotal}
                      incomeTotal={monthSummary.incomeTotal}
                      size={isMobile ? 140 : 320}
                    />
                  </div>
                )}

                {/* Calendar */}
                <div className={`${hasChartData ? "lg:col-span-2" : "lg:col-span-3"} bg-gb-bg0 nb-card rounded-sm p-3 md:p-6 md:flex-1 md:min-h-0 md:overflow-y-auto`}>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
