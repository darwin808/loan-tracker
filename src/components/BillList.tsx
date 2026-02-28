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

const RATE_SUFFIX: Record<string, string> = {
  weekly: "/wk",
  biweekly: "/2wk",
  monthly: "/mo",
  yearly: "/yr",
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
            className={`rounded-md border-l-4 ${color.border} bg-gb-bg0 shadow-sm`}
          >
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-gb-fg0 text-sm">{bill.name}</span>
                <span className="font-semibold text-gb-fg1 text-sm">
                  ₱{bill.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${color.bg} ${color.text}`}>
                    {FREQUENCY_LABELS[bill.frequency]}
                  </span>
                  <span className="text-xs text-gb-fg4">
                    {RATE_SUFFIX[bill.frequency]} &middot; from {bill.startDate}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(bill)}
                    className="text-[11px] text-gb-fg4 hover:text-gb-blue"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(bill.id)}
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
