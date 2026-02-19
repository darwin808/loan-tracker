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

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
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

        return (
          <div
            key={loan.id}
            className="rounded-md border border-gb-bg3 bg-gb-bg0 p-3"
          >
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full shrink-0 ${color.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gb-fg1 text-sm truncate">
                    {loan.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}>
                    {FREQUENCY_LABELS[loan.frequency]}
                  </span>
                </div>
                <div className="text-xs text-gb-fg4">
                  ₱{loan.paymentAmount.toLocaleString()}/{loan.frequency === "daily" ? "day" : loan.frequency === "weekly" ? "wk" : "mo"}
                  &middot; {schedule.length} payments
                  &middot; {loan.startDate} → {endDate ?? "—"}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(loan)}
                  className="text-xs text-gb-fg4 hover:text-gb-blue px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(loan.id)}
                  className="text-xs text-gb-fg4 hover:text-gb-red px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gb-fg4 mb-1">
                <span>{paidCount} of {schedule.length} paid</span>
                <span>₱{remaining.toLocaleString()} remaining</span>
              </div>
              <div className="h-1.5 rounded-full bg-gb-bg2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${color.dot}`}
                  style={{ width: `${Math.min(100, (paid / loan.amount) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
