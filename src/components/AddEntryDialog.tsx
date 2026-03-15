"use client";

import { useState } from "react";
import { X, Landmark, Receipt, TrendingUp } from "lucide-react";
import LoanForm from "./LoanForm";
import BillForm from "./BillForm";
import type { LoanInput, BillInput } from "@/lib/types";

type EntryType = "loan" | "bill" | "income";

interface AddEntryDialogProps {
  date: string;
  onAddLoan: (input: LoanInput) => Promise<void>;
  onAddBill: (input: BillInput) => Promise<void>;
  onClose: () => void;
}

const TABS: { type: EntryType; label: string; icon: typeof Landmark; color: string; activeColor: string }[] = [
  { type: "loan", label: "Loan", icon: Landmark, color: "text-gb-fg3", activeColor: "bg-gb-blue text-gb-bg0" },
  { type: "bill", label: "Bill", icon: Receipt, color: "text-gb-fg3", activeColor: "bg-gb-orange text-gb-bg0" },
  { type: "income", label: "Income", icon: TrendingUp, color: "text-gb-fg3", activeColor: "bg-gb-green text-gb-bg0" },
];

export default function AddEntryDialog({ date, onAddLoan, onAddBill, onClose }: AddEntryDialogProps) {
  const [activeType, setActiveType] = useState<EntryType>("bill");

  const handleAddLoan = async (input: LoanInput) => {
    await onAddLoan(input);
    onClose();
  };

  const handleAddBill = async (input: BillInput) => {
    await onAddBill(input);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-gb-fg0/40" />
      <div
        className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-96 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gb-fg1 text-sm">Add entry for {date}</h3>
          <button onClick={onClose} className="text-gb-fg4 hover:text-gb-fg2">
            <X size={16} />
          </button>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-1 mb-4">
          {TABS.map(({ type, label, icon: Icon, color, activeColor }) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-sm transition-colors ${
                activeType === type ? activeColor : `${color} hover:bg-gb-bg2`
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        {activeType === "loan" && (
          <LoanForm onSubmit={handleAddLoan} defaultStartDate={date} />
        )}
        {activeType === "bill" && (
          <BillForm onSubmit={handleAddBill} defaultType="expense" defaultStartDate={date} />
        )}
        {activeType === "income" && (
          <BillForm onSubmit={handleAddBill} defaultType="income" defaultStartDate={date} />
        )}
      </div>
    </div>
  );
}
