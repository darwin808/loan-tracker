"use client";

import { useState } from "react";
import { CheckCircle, Undo2, X } from "lucide-react";
import type { LoanColor } from "@/lib/colors";

export interface PaymentDialogData {
  type: "loan" | "bill" | "income";
  itemId: number;
  name: string;
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
  onRecordBillPayment?: (billId: number, date: string, amount: number) => Promise<void>;
  onUndoBillPayment?: (billId: number, date: string) => Promise<void>;
  onClose: () => void;
}

export default function PaymentDialog({ data, onRecord, onUndo, onRecordBillPayment, onUndoBillPayment, onClose }: PaymentDialogProps) {
  const isBill = data.type === "bill" || data.type === "income";
  const [amount, setAmount] = useState(data.paidAmount ?? data.scheduledAmount);
  const [submitting, setSubmitting] = useState(false);

  const handleRecord = async () => {
    if (isBill) {
      setSubmitting(true);
      try {
        await onRecordBillPayment?.(data.itemId, data.date, data.scheduledAmount);
        onClose();
      } finally {
        setSubmitting(false);
      }
    } else {
      if (amount <= 0) return;
      setSubmitting(true);
      try {
        await onRecord(data.itemId, data.date, amount);
        onClose();
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleUndo = async () => {
    setSubmitting(true);
    try {
      if (isBill) {
        await onUndoBillPayment?.(data.itemId, data.date);
      } else {
        await onUndo(data.itemId, data.date);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-gb-fg0/40" />
      <div
        className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`h-3 w-3 rounded-full ${data.color.dot}`} />
          <span className="font-medium text-gb-fg1 text-sm">{data.name}</span>
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
                className="flex-1 nb-btn rounded-sm bg-gb-red-bg px-3 py-2 text-sm font-bold text-gb-red hover:nb-btn-press disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Undo2 size={14} />
                Undo Payment
              </button>
              <button
                onClick={onClose}
                className="nb-btn rounded-sm bg-gb-bg0 px-3 py-2 text-sm font-bold text-gb-fg2 hover:nb-btn-press flex items-center justify-center gap-1.5"
              >
                <X size={14} />
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!isBill && (
              <div>
                <label className="block text-xs text-gb-fg3 mb-1">Amount to pay (PHP)</label>
                <input
                  type="number"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleRecord}
                disabled={submitting || (!isBill && amount <= 0)}
                className="flex-1 nb-btn rounded-sm bg-gb-blue px-3 py-2 text-sm font-bold text-gb-bg0 hover:nb-btn-press disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={14} />
                {submitting ? "Saving..." : "Mark Paid"}
              </button>
              <button
                onClick={onClose}
                className="nb-btn rounded-sm bg-gb-bg0 px-3 py-2 text-sm font-bold text-gb-fg2 hover:nb-btn-press"
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
