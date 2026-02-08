"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import CalendarDayCell, { type DayPayment } from "./CalendarDayCell";
import PaymentDialog, { type PaymentDialogData } from "./PaymentDialog";
import { getPaymentSchedule } from "@/lib/payments";
import { getLoanColor } from "@/lib/colors";
import type { Loan, Payment } from "@/lib/types";

interface CalendarProps {
  loans: Loan[];
  payments: Payment[];
  onRecordPayment: (loanId: number, date: string, amount: number) => Promise<void>;
  onUndoPayment: (loanId: number, date: string) => Promise<void>;
}

type ViewMode = "month" | "year";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({ loans, payments, onRecordPayment, onUndoPayment }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [dialog, setDialog] = useState<PaymentDialogData | null>(null);

  // Build a map of date string -> day payments across all loans
  const paymentMap = useMemo(() => {
    const map = new Map<string, DayPayment[]>();

    loans.forEach((loan, index) => {
      const color = getLoanColor(index);
      const schedule = getPaymentSchedule(loan, payments);

      for (const entry of schedule) {
        const existing = map.get(entry.date) ?? [];
        existing.push({
          loanId: loan.id,
          loanName: loan.name,
          scheduledAmount: entry.scheduledAmount,
          paid: entry.paid,
          paidAmount: entry.paidAmount,
          canPay: entry.canPay,
          color,
        });
        map.set(entry.date, existing);
      }
    });

    return map;
  }, [loans, payments]);

  const currentYear = currentMonth.getFullYear();

  const handlePaymentClick = (p: DayPayment, date: string) => {
    setDialog({
      loanId: p.loanId,
      loanName: p.loanName,
      date,
      scheduledAmount: p.scheduledAmount,
      paid: p.paid,
      paidAmount: p.paidAmount,
      color: p.color,
    });
  };

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth((m) =>
              view === "year"
                ? new Date(m.getFullYear() - 1, m.getMonth())
                : subMonths(m, 1)
            )
          }
          className="px-3 py-1.5 text-sm rounded-md border border-gb-bg3 hover:bg-gb-bg1 text-gb-fg2"
        >
          Prev
        </button>
        <h2 className="text-lg font-semibold text-gb-fg1">
          {view === "month" ? format(currentMonth, "MMMM yyyy") : currentYear.toString()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-sm rounded-md border border-gb-bg3 hover:bg-gb-bg1 text-gb-fg2"
          >
            Today
          </button>
          <button
            onClick={() => setView(view === "month" ? "year" : "month")}
            className="px-3 py-1.5 text-sm rounded-md border border-gb-bg3 hover:bg-gb-bg1 text-gb-fg2"
          >
            {view === "month" ? "Year" : "Month"}
          </button>
          <button
            onClick={() =>
              setCurrentMonth((m) =>
                view === "year"
                  ? new Date(m.getFullYear() + 1, m.getMonth())
                  : addMonths(m, 1)
              )
            }
            className="px-3 py-1.5 text-sm rounded-md border border-gb-bg3 hover:bg-gb-bg1 text-gb-fg2"
          >
            Next
          </button>
        </div>
      </div>

      {view === "month" ? (
        <MonthView
          currentMonth={currentMonth}
          paymentMap={paymentMap}
          onPaymentClick={handlePaymentClick}
        />
      ) : (
        <YearView
          year={currentYear}
          paymentMap={paymentMap}
          onSelectMonth={(month) => {
            setCurrentMonth(month);
            setView("month");
          }}
        />
      )}

      {dialog && (
        <PaymentDialog
          data={dialog}
          onRecord={onRecordPayment}
          onUndo={onUndoPayment}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

/* ── Month View ─────────────────────────────────────────── */

function MonthView({
  currentMonth,
  paymentMap,
  onPaymentClick,
}: {
  currentMonth: Date;
  paymentMap: Map<string, DayPayment[]>;
  onPaymentClick: (p: DayPayment, date: string) => void;
}) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  return (
    <>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gb-fg4 py-2 border-b border-gb-bg2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((date, i) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dayPayments = paymentMap.get(dateStr) ?? [];
          return (
            <CalendarDayCell
              key={i}
              date={date}
              currentMonth={currentMonth}
              payments={dayPayments}
              onPaymentClick={onPaymentClick}
            />
          );
        })}
      </div>
    </>
  );
}

/* ── Year View ──────────────────────────────────────────── */

function YearView({
  year,
  paymentMap,
  onSelectMonth,
}: {
  year: number;
  paymentMap: Map<string, DayPayment[]>;
  onSelectMonth: (month: Date) => void;
}) {
  const months = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  }, [year]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
      {months.map((month) => (
        <MiniMonth
          key={month.getMonth()}
          month={month}
          paymentMap={paymentMap}
          onClick={() => onSelectMonth(month)}
        />
      ))}
    </div>
  );
}

function MiniMonth({
  month,
  paymentMap,
  onClick,
}: {
  month: Date;
  paymentMap: Map<string, DayPayment[]>;
  onClick: () => void;
}) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const result: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [month]);

  return (
    <button
      onClick={onClick}
      className="text-left p-2 rounded-md border border-gb-bg2 hover:bg-gb-bg1 cursor-pointer"
    >
      <div className="text-xs font-semibold text-gb-fg1 mb-1">
        {format(month, "MMMM")}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div key={i} className="text-[8px] text-gb-fg4 text-center">
            {d}
          </div>
        ))}
        {days.map((date, i) => {
          const inMonth = isSameMonth(date, month);
          const dateStr = format(date, "yyyy-MM-dd");
          const dayPayments = paymentMap.get(dateStr) ?? [];
          const today = isToday(date);
          const allPaid = dayPayments.length > 0 && dayPayments.every((p) => p.paid);

          return (
            <div key={i} className="relative flex items-center justify-center h-5">
              {inMonth ? (
                <>
                  <span
                    className={`text-[9px] leading-none z-10 ${
                      today
                        ? "font-bold text-gb-orange"
                        : dayPayments.length > 0
                        ? "font-medium text-gb-fg0"
                        : "text-gb-fg4"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayPayments.length > 0 && (
                    <span className={`absolute inset-0 rounded-sm overflow-hidden flex ${allPaid ? "opacity-50" : ""}`}>
                      {dayPayments.map((p, j) => (
                        <span
                          key={j}
                          className={`${p.color.bg} flex-1`}
                        />
                      ))}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[9px] leading-none text-transparent">
                  {date.getDate()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </button>
  );
}
