"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, Calendar as CalendarIcon } from "lucide-react";
import CalendarDayCell, { type DayPayment } from "./CalendarDayCell";
import PaymentDialog, { type PaymentDialogData } from "./PaymentDialog";
import DayOverviewDialog from "./DayOverviewDialog";
import RangeSummaryDialog from "./RangeSummaryDialog";
import { getPaymentSchedule } from "@/lib/payments";
import { getBillSchedule } from "@/lib/bill-schedule";
import { getLoanColor, getBillColor, getIncomeColor } from "@/lib/colors";
import type { Loan, Payment, Bill, BillPayment } from "@/lib/types";

interface CalendarProps {
  loans: Loan[];
  payments: Payment[];
  bills: Bill[];
  billPayments: BillPayment[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  onRecordPayment: (loanId: number, date: string, amount: number) => Promise<void>;
  onUndoPayment: (loanId: number, date: string) => Promise<void>;
  onRecordBillPayment: (billId: number, date: string, amount: number) => Promise<void>;
  onUndoBillPayment: (billId: number, date: string) => Promise<void>;
}

type ViewMode = "month" | "year";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({ loans, payments, bills, billPayments, currentMonth, onMonthChange: setCurrentMonth, onRecordPayment, onUndoPayment, onRecordBillPayment, onUndoBillPayment }: CalendarProps) {
  const [view, setView] = useState<ViewMode>("month");
  const [dialog, setDialog] = useState<PaymentDialogData | null>(null);
  const [dayOverview, setDayOverview] = useState<{ payments: DayPayment[]; date: string } | null>(null);
  const [rangeSummary, setRangeSummary] = useState<{ start: string; end: string } | null>(null);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const isDragging = dragStart !== null;

  const handleDragStart = useCallback((date: string) => {
    setDragStart(date);
    setDragEnd(date);
  }, []);

  const handleDragEnter = useCallback((date: string) => {
    if (dragStart) setDragEnd(date);
  }, [dragStart]);

  const handleDragEnd = useCallback(() => {
    if (dragStart && dragEnd) {
      const [start, end] = dragStart <= dragEnd ? [dragStart, dragEnd] : [dragEnd, dragStart];
      if (start !== end) {
        setRangeSummary({ start, end });
      }
    }
    setDragStart(null);
    setDragEnd(null);
  }, [dragStart, dragEnd]);

  // Compute selected date range for highlighting
  const selectedRange = useMemo(() => {
    if (!dragStart || !dragEnd) return null;
    const [start, end] = dragStart <= dragEnd ? [dragStart, dragEnd] : [dragEnd, dragStart];
    return { start, end };
  }, [dragStart, dragEnd]);

  // Build a map of date string -> day payments across all loans and bills
  const paymentMap = useMemo(() => {
    const map = new Map<string, DayPayment[]>();

    loans.forEach((loan) => {
      const color = getLoanColor(loan.id);
      const schedule = getPaymentSchedule(loan, payments);

      for (const entry of schedule) {
        const existing = map.get(entry.date) ?? [];
        existing.push({
          type: "loan",
          itemId: loan.id,
          name: loan.name,
          scheduledAmount: entry.scheduledAmount,
          paid: entry.paid,
          paidAmount: entry.paidAmount,
          canPay: entry.canPay,
          color,
        });
        map.set(entry.date, existing);
      }
    });

    // Bill schedule: cap at end of current calendar year + 1 year
    const maxDate = new Date(currentMonth.getFullYear() + 1, 11, 31);
    bills.forEach((bill) => {
      const isIncome = bill.type === "income";
      const color = isIncome ? getIncomeColor() : getBillColor(bill.id);
      const schedule = getBillSchedule(bill, billPayments, maxDate);

      for (const entry of schedule) {
        const existing = map.get(entry.date) ?? [];
        existing.push({
          type: isIncome ? "income" : "bill",
          itemId: bill.id,
          name: bill.name,
          scheduledAmount: entry.scheduledAmount,
          paid: entry.paid,
          paidAmount: entry.paidAmount,
          canPay: true, // bills/income are always independently payable
          color,
        });
        map.set(entry.date, existing);
      }
    });

    return map;
  }, [loans, payments, bills, billPayments, currentMonth]);

  // End drag if mouse is released anywhere on the page
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseUp = () => handleDragEnd();
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging, handleDragEnd]);

  const currentYear = currentMonth.getFullYear();

  const handlePaymentClick = (p: DayPayment, date: string) => {
    setDialog({
      type: p.type,
      itemId: p.itemId,
      name: p.name,
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
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              setCurrentMonth(
                view === "year"
                  ? new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth())
                  : subMonths(currentMonth, 1)
              )
            }
            className="p-1 md:p-1.5 rounded-sm text-gb-fg3 hover:text-gb-fg0 hover:bg-gb-bg2 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-sm md:text-lg font-bold text-gb-fg0 min-w-[130px] md:min-w-[180px] text-center">
            {view === "month" ? format(currentMonth, "MMMM yyyy") : currentYear.toString()}
          </h2>
          <button
            onClick={() =>
              setCurrentMonth(
                view === "year"
                  ? new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth())
                  : addMonths(currentMonth, 1)
              )
            }
            className="p-1 md:p-1.5 rounded-sm text-gb-fg3 hover:text-gb-fg0 hover:bg-gb-bg2 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-2.5 py-1 text-xs md:text-sm font-medium rounded-sm text-gb-fg3 hover:text-gb-fg0 hover:bg-gb-bg2 transition-colors flex items-center gap-1"
          >
            <CalendarDays size={14} />
            <span className="hidden md:inline">Today</span>
          </button>
          <button
            onClick={() => setView(view === "month" ? "year" : "month")}
            className="p-1 md:p-1.5 rounded-sm text-gb-fg3 hover:text-gb-fg0 hover:bg-gb-bg2 transition-colors"
            title={view === "month" ? "Year view" : "Month view"}
          >
            {view === "month" ? <LayoutGrid size={18} /> : <CalendarIcon size={18} />}
          </button>
        </div>
      </div>

      {view === "month" ? (
        <MonthView
          currentMonth={currentMonth}
          paymentMap={paymentMap}
          selectedRange={selectedRange}
          onPaymentClick={handlePaymentClick}
          onOverflowClick={(payments, date) => setDayOverview({ payments, date })}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
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

      {dayOverview && (
        <DayOverviewDialog
          date={dayOverview.date}
          payments={dayOverview.payments}
          onPaymentClick={(p) => {
            setDayOverview(null);
            handlePaymentClick(p, dayOverview.date);
          }}
          onClose={() => setDayOverview(null)}
        />
      )}

      {rangeSummary && (
        <RangeSummaryDialog
          startDate={rangeSummary.start}
          endDate={rangeSummary.end}
          paymentMap={paymentMap}
          onClose={() => setRangeSummary(null)}
        />
      )}

      {dialog && (
        <PaymentDialog
          data={dialog}
          onRecord={onRecordPayment}
          onUndo={onUndoPayment}
          onRecordBillPayment={onRecordBillPayment}
          onUndoBillPayment={onUndoBillPayment}
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
  selectedRange,
  onPaymentClick,
  onOverflowClick,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  currentMonth: Date;
  paymentMap: Map<string, DayPayment[]>;
  selectedRange: { start: string; end: string } | null;
  onPaymentClick: (p: DayPayment, date: string) => void;
  onOverflowClick: (payments: DayPayment[], date: string) => void;
  onDragStart: (date: string) => void;
  onDragEnter: (date: string) => void;
  onDragEnd: () => void;
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
      <div className="grid grid-cols-7 bg-gb-bg1 rounded-t-sm">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className="text-center text-[10px] md:text-xs font-bold text-gb-fg3 uppercase tracking-wider py-1.5 md:py-2"
          >
            <span className="md:hidden">{WEEKDAYS_SHORT[i]}</span>
            <span className="hidden md:inline">{day}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border border-gb-bg2 rounded-b-sm overflow-hidden">
        {calendarDays.map((date, i) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dayPayments = paymentMap.get(dateStr) ?? [];
          const isSelected = selectedRange !== null && dateStr >= selectedRange.start && dateStr <= selectedRange.end;
          return (
            <CalendarDayCell
              key={i}
              date={date}
              currentMonth={currentMonth}
              payments={dayPayments}
              selected={isSelected}
              onPaymentClick={onPaymentClick}
              onOverflowClick={onOverflowClick}
              onDragStart={onDragStart}
              onDragEnter={onDragEnter}
              onDragEnd={onDragEnd}
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
      className="text-left p-2 nb-card-sm rounded-sm hover:bg-gb-bg1 cursor-pointer"
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
          const today = mounted && isToday(date);
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
