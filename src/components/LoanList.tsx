"use client";

import type { Loan, Payment } from "@/lib/types";
import { getLoanColor } from "@/lib/colors";
import { getPaymentSchedule, getEndDate, getTotalPaid } from "@/lib/payments";

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
  if (loans.length === 0) {
    return (
      <div className="text-sm text-gb-fg4 text-center py-8">
        No loans yet. Add one above.
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
          ₱{totalPaidAll.toLocaleString()} / ₱{totalAmount.toLocaleString()}
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
            className={`rounded-md border-l-4 ${color.border} bg-gb-bg0 shadow-sm`}
          >
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-gb-fg0 text-sm">{loan.name}</span>
                <span className="font-semibold text-gb-fg1 text-sm">
                  ₱{loan.paymentAmount.toLocaleString()}{RATE_SUFFIX[loan.frequency]}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gb-fg4 mb-1">
                  <span>{paidCount}/{schedule.length} paid</span>
                  <span>₱{remaining.toLocaleString()} left</span>
                </div>
                <div className="h-1.5 rounded-full bg-gb-bg2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color.dot}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gb-fg4">
                  {loan.startDate} → {endDate ?? "—"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(loan)}
                    className="text-[11px] text-gb-fg4 hover:text-gb-blue"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(loan.id)}
                    className="text-[11px] text-gb-fg4 hover:text-gb-red"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
