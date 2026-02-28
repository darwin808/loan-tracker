"use client";

import type { Bill } from "@/lib/types";
import { getBillColor } from "@/lib/colors";

interface BillListProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: number) => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
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
            className="rounded-md border border-gb-bg3 bg-gb-bg0 p-3"
          >
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full shrink-0 ${color.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gb-fg1 text-sm truncate">
                    {bill.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}>
                    {FREQUENCY_LABELS[bill.frequency]}
                  </span>
                </div>
                <div className="text-xs text-gb-fg4">
                  ₱{bill.amount.toLocaleString()}/{bill.frequency === "yearly" ? "yr" : "mo"}
                  &middot; from {bill.startDate}
                </div>
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
          </div>
        );
      })}
    </div>
  );
}
