"use client";

import type { Bill } from "@/lib/types";
import { getBillColor } from "@/lib/colors";

interface BillListProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: number) => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 Wks",
  monthly: "Monthly",
  yearly: "Yearly",
};

export default function BillList({ bills, onEdit, onDelete }: BillListProps) {
  if (bills.length === 0) {
    return (
      <div className="text-sm text-gb-fg4 text-center py-8">
        No bills yet. Add one above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gb-fg1">Your Bills</h2>
      {bills.map((bill) => {
        const color = getBillColor(bill.id);

        return (
          <div
            key={bill.id}
            className="rounded-md border border-gb-bg3 bg-gb-bg0 p-3 space-y-1"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-3 w-3 rounded-full shrink-0 ${color.dot}`} />
                <span className="font-medium text-gb-fg1 text-sm break-words">
                  {bill.name}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(bill)}
                  className="text-xs text-gb-fg4 hover:text-gb-blue px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(bill.id)}
                  className="text-xs text-gb-fg4 hover:text-gb-red px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-5 text-xs text-gb-fg4">
              <span className={`px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}>
                {FREQUENCY_LABELS[bill.frequency]}
              </span>
              <span>
                ₱{bill.amount.toLocaleString()}/{bill.frequency === "yearly" ? "yr" : bill.frequency === "monthly" ? "mo" : bill.frequency === "biweekly" ? "2wk" : "wk"}
              </span>
              <span>&middot; from {bill.startDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
