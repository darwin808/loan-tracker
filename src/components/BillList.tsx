"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { Bill } from "@/lib/types";
import { getBillColor } from "@/lib/colors";

function fmtDate(d: string) { return format(parseISO(d), "MMM d, yyyy"); }

interface BillListProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: number) => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
  once: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 Wks",
  monthly: "Monthly",
  yearly: "Yearly",
};

const RATE_SUFFIX: Record<string, string> = {
  daily: "/day",
  weekly: "/wk",
  biweekly: "/2wk",
  monthly: "/mo",
  yearly: "/yr",
};

export default function BillList({ bills, onEdit, onDelete }: BillListProps) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

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
            className={`relative rounded-md border-l-4 ${color.border} bg-gb-bg0 shadow-sm cursor-pointer hover:bg-gb-bg1 transition-colors`}
            onClick={() => onEdit(bill)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmingId(bill.id);
              }}
              className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded text-gb-fg4 hover:text-gb-red hover:bg-gb-red-bg text-sm leading-none"
              title="Delete bill"
            >
              &times;
            </button>
            <div className="px-3 py-2.5 pr-7">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-gb-fg0 text-sm">{bill.name}</span>
                <span className="font-semibold text-gb-fg1 text-sm">
                  ₱{bill.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${color.bg} ${color.text}`}>
                  {FREQUENCY_LABELS[bill.frequency]}
                </span>
                <span className="text-xs text-gb-fg4">
                  {bill.frequency === "once" ? `on ${fmtDate(bill.startDate)}` : `${RATE_SUFFIX[bill.frequency]} \u00b7 from ${fmtDate(bill.startDate)}`}
                </span>
              </div>
            </div>

            {/* Delete confirmation overlay */}
            {confirmingId === bill.id && (
              <div
                className="absolute inset-0 bg-gb-bg0/95 rounded-md flex items-center justify-center gap-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm text-gb-fg2">Delete?</span>
                <button
                  onClick={() => { onDelete(bill.id); setConfirmingId(null); }}
                  className="rounded px-2.5 py-1 text-xs font-medium bg-gb-red text-gb-bg0 hover:bg-gb-red-dim"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmingId(null)}
                  className="rounded px-2.5 py-1 text-xs font-medium border border-gb-bg3 text-gb-fg2 hover:bg-gb-bg1"
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
