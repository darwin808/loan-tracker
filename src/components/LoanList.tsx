"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import type { Loan, Payment } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { getLoanColor } from "@/lib/colors";
import { getPaymentSchedule, getEndDate, getTotalPaid } from "@/lib/payments";

function fmtDate(d: string) { return format(parseISO(d), "MMM d, yyyy"); }

interface LoanListProps {
  loans: Loan[];
  payments: Payment[];
  onEdit: (loan: Loan) => void;
  onDelete: (id: number) => void;
}

const RATE_SUFFIX: Record<string, string> = {
  daily: "/day",
  weekly: "/wk",
  monthly: "/mo",
};

export default function LoanList({ loans, payments, onEdit, onDelete }: LoanListProps) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const { fmt } = useCurrency();

  if (loans.length === 0) {
    return (
      <div className="text-sm text-gb-fg4 text-center py-8">
        No loans yet.
      </div>
    );
  }

  const totalAmount = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalPaidAll = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gb-fg1">Your Loans</h2>
        <span className="text-sm font-medium text-gb-fg3">
          {fmt(totalPaidAll)} / {fmt(totalAmount)}
        </span>
      </div>
      {loans.map((loan) => {
        const color = getLoanColor(loan.id);
        const schedule = getPaymentSchedule(loan, payments);
        const endDate = getEndDate(loan, payments);
        const paid = getTotalPaid(loan, payments);
        const remaining = Math.max(0, Math.round((loan.amount - paid) * 100) / 100);
        const paidCount = schedule.filter((e) => e.paid).length;
        const progress = Math.min(100, (paid / loan.amount) * 100);

        return (
          <div
            key={loan.id}
            className={`relative nb-card-sm rounded-sm border-l-4 ${color.border} bg-gb-bg0 cursor-pointer hover:bg-gb-bg1 transition-colors`}
            onClick={() => onEdit(loan)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmingId(loan.id);
              }}
              className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded text-gb-fg4 hover:text-gb-red hover:bg-gb-red-bg text-sm leading-none"
              title="Delete loan"
            >
              <X size={12} />
            </button>
            <div className="px-3 py-2.5 pr-7">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-gb-fg0 text-sm">{loan.name}</span>
                <span className="font-semibold text-gb-fg1 text-sm">
                  {fmt(loan.paymentAmount)}{RATE_SUFFIX[loan.frequency]}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gb-fg4 mb-1">
                  <span>{paidCount}/{schedule.length} paid</span>
                  <span>{fmt(remaining)} left</span>
                </div>
                <div className="h-1.5 bg-gb-bg2 overflow-hidden">
                  <div
                    className={`h-full ${color.dot}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gb-fg4">
                {fmtDate(loan.startDate)} → {endDate ? fmtDate(endDate) : "—"}
              </div>
            </div>

            {/* Delete confirmation overlay */}
            {confirmingId === loan.id && (
              <div
                className="absolute inset-0 bg-gb-bg0/95 rounded-sm flex items-center justify-center gap-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm text-gb-fg2">Delete?</span>
                <button
                  onClick={() => { onDelete(loan.id); setConfirmingId(null); }}
                  className="nb-btn rounded-sm px-2.5 py-1 text-xs font-bold bg-gb-red text-gb-bg0 hover:nb-btn-press"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmingId(null)}
                  className="nb-btn rounded-sm px-2.5 py-1 text-xs font-bold bg-gb-bg0 text-gb-fg2 hover:nb-btn-press"
                >
                  No
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
