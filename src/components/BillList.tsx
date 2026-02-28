"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import type { Bill, BillType } from "@/lib/types";
import { getBillColor, getIncomeColor } from "@/lib/colors";
import { useCurrency } from "@/lib/currency";

function fmtDate(d: string) { return format(parseISO(d), "MMM d, yyyy"); }

interface BillListProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: number) => void;
  filterType?: BillType;
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

export default function BillList({ bills, onEdit, onDelete, filterType }: BillListProps) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const { fmt } = useCurrency();
  const filtered = filterType ? bills.filter((b) => b.type === filterType) : bills;
  const isIncome = filterType === "income";

  if (filtered.length === 0) {
    return (
      <div className="text-sm text-gb-fg4 text-center py-8">
        No {isIncome ? "income" : "bills"} yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gb-fg1">{isIncome ? "Your Income" : "Your Bills"}</h2>
      {filtered.map((bill) => {
        const color = bill.type === "income" ? getIncomeColor() : getBillColor(bill.id);

        return (
          <div
            key={bill.id}
            className={`relative nb-card-sm rounded-sm border-l-4 ${color.border} bg-gb-bg0 cursor-pointer hover:bg-gb-bg1 transition-colors`}
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
              <X size={12} />
            </button>
            <div className="px-3 py-2.5 pr-7">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-gb-fg0 text-sm">{bill.name}</span>
                <span className="font-semibold text-gb-fg1 text-sm">
                  {fmt(bill.amount)}
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
                className="absolute inset-0 bg-gb-bg0/95 rounded-sm flex items-center justify-center gap-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm text-gb-fg2">Delete?</span>
                <button
                  onClick={() => { onDelete(bill.id); setConfirmingId(null); }}
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
