"use client";

import { useState } from "react";
import type { LoanColor } from "@/lib/colors";

export interface PaymentDialogData {
  loanId: number;
  loanName: string;
  date: string;
  scheduledAmount: number;
  paid: boolean;
  paidAmount: number | null;
  color: LoanColor;
}

interface PaymentDialogProps {
  data: PaymentDialogData;
  onRecord: (loanId: number, date: string, amount: number) => Promise<void>;
  onUndo: (loanId: number, date: string) => Promise<void>;
  onClose: () => void;
}

export default function PaymentDialog({ data, onRecord, onUndo, onClose }: PaymentDialogProps) {
  const [amount, setAmount] = useState(data.paidAmount ?? data.scheduledAmount);
  const [submitting, setSubmitting] = useState(false);

  const handleRecord = async () => {
    if (amount <= 0) return;
    setSubmitting(true);
    try {
      await onRecord(data.loanId, data.date, amount);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUndo = async () => {
    setSubmitting(true);
    try {
      await onUndo(data.loanId, data.date);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-gb-fg0/30" />
      <div
        className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg p-4 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`h-3 w-3 rounded-full ${data.color.dot}`} />
          <span className="font-medium text-gb-fg1 text-sm">{data.loanName}</span>
        </div>

        <div className="text-xs text-gb-fg4 mb-1">{data.date}</div>
        <div className="text-sm text-gb-fg2 mb-3">
          Scheduled: ₱{data.scheduledAmount.toLocaleString()}
        </div>

        {data.paid ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gb-aqua-dim">
              Paid: ₱{data.paidAmount?.toLocaleString()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={submitting}
                className="flex-1 rounded-md border border-gb-red/30 px-3 py-2 text-sm text-gb-red hover:bg-gb-red/10 disabled:opacity-50"
              >
                Undo Payment
              </button>
              <button
                onClick={onClose}
                className="rounded-md border border-gb-bg3 px-3 py-2 text-sm text-gb-fg2 hover:bg-gb-bg1"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gb-fg3 mb-1">Amount to pay (PHP)</label>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue focus:ring-1 focus:ring-gb-blue outline-none"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRecord}
                disabled={submitting || amount <= 0}
                className="flex-1 rounded-md bg-gb-blue px-3 py-2 text-sm font-medium text-gb-bg0 hover:bg-gb-blue-dim disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Mark Paid"}
              </button>
              <button
                onClick={onClose}
                className="rounded-md border border-gb-bg3 px-3 py-2 text-sm text-gb-fg2 hover:bg-gb-bg1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
