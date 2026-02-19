import { useState, useEffect } from "react";
import { isSameMonth, isToday } from "date-fns";
import LoanIndicator from "./LoanIndicator";
import type { LoanColor } from "@/lib/colors";

export interface DayPayment {
  loanId: number;
  loanName: string;
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
  onPaymentClick?: (payment: DayPayment, date: string) => void;
  onOverflowClick?: (payments: DayPayment[], date: string) => void;
}

const MAX_VISIBLE = 3;

export default function CalendarDayCell({
  date,
  currentMonth,
  payments,
  onPaymentClick,
  onOverflowClick,
}: CalendarDayCellProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const inMonth = isSameMonth(date, currentMonth);
  const today = mounted && isToday(date);
  const overflow = payments.length - MAX_VISIBLE;

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div
      className={`min-h-[80px] border border-gb-bg2 p-1 ${
        inMonth ? "bg-gb-bg0" : "bg-gb-bg1"
      }`}
    >
      <div
        className={`text-xs font-medium mb-0.5 ${
          today
            ? "bg-gb-orange text-gb-bg0 w-5 h-5 rounded-full flex items-center justify-center"
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
            name={p.loanName}
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
