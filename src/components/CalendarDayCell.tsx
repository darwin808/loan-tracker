import { useState, useEffect } from "react";
import { isSameMonth, isToday } from "date-fns";
import LoanIndicator from "./LoanIndicator";
import type { LoanColor } from "@/lib/colors";

export interface DayPayment {
  type: "loan" | "bill" | "income";
  itemId: number;
  name: string;
  scheduledAmount: number;
  paid: boolean;
  paidAmount: number | null;
  canPay: boolean;
  color: LoanColor;
}

interface CalendarDayCellProps {
  date: Date;
  currentMonth: Date;
  payments: DayPayment[];
  selected?: boolean;
  onPaymentClick?: (payment: DayPayment, date: string) => void;
  onOverflowClick?: (payments: DayPayment[], date: string) => void;
  onDragStart?: (date: string) => void;
  onDragEnter?: (date: string) => void;
  onDragEnd?: () => void;
}

const MAX_VISIBLE = 3;

export default function CalendarDayCell({
  date,
  currentMonth,
  payments,
  selected,
  onPaymentClick,
  onOverflowClick,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: CalendarDayCellProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const inMonth = isSameMonth(date, currentMonth);
  const today = mounted && isToday(date);
  const overflow = payments.length - MAX_VISIBLE;

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div
      className={`min-h-[50px] md:min-h-[80px] border-2 border-gb-fg0 p-1 select-none ${
        selected
          ? "bg-gb-blue-bg"
          : inMonth
          ? "bg-gb-bg0"
          : "bg-gb-bg1"
      }`}
      onMouseDown={(e) => {
        // Only start drag from the cell background, not from indicators
        if ((e.target as HTMLElement).closest("button")) return;
        e.preventDefault();
        onDragStart?.(dateStr);
      }}
      onMouseEnter={() => onDragEnter?.(dateStr)}
      onMouseUp={() => onDragEnd?.()}
      onTouchStart={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        onDragStart?.(dateStr);
      }}
      onTouchEnd={() => onDragEnd?.()}
    >
      <div
        className={`text-xs font-medium mb-0.5 ${
          today
            ? "bg-gb-orange text-gb-bg0 w-5 h-5 flex items-center justify-center font-bold"
            : inMonth
            ? "text-gb-fg1"
            : "text-gb-bg4"
        }`}
      >
        {date.getDate()}
      </div>
      <div className="space-y-0.5">
        {payments.slice(0, MAX_VISIBLE).map((p, i) => (
          <LoanIndicator
            key={i}
            name={p.name}
            scheduledAmount={p.scheduledAmount}
            paid={p.paid}
            paidAmount={p.paidAmount}
            canPay={p.canPay}
            color={p.color}
            onClick={(p.paid || p.canPay) ? () => onPaymentClick?.(p, dateStr) : undefined}
          />
        ))}
        {overflow > 0 && (
          <button
            type="button"
            onClick={() => onOverflowClick?.(payments, dateStr)}
            className="text-[10px] text-gb-blue hover:text-gb-blue-dim pl-1 cursor-pointer"
          >
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
}
