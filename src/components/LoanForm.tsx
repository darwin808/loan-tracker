"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Loan, LoanInput, Frequency } from "@/lib/types";
import { useCurrency } from "@/lib/currency";

interface LoanFormProps {
  onSubmit: (input: LoanInput) => Promise<void>;
  editingLoan?: Loan | null;
  onCancelEdit?: () => void;
}

const EMPTY_FORM: LoanInput = {
  name: "",
  amount: 0,
  paymentAmount: 0,
  frequency: "monthly",
  startDate: "",
};

export default function LoanForm({ onSubmit, editingLoan, onCancelEdit }: LoanFormProps) {
  const { fmt, currency } = useCurrency();
  const [form, setForm] = useState<LoanInput>(
    editingLoan
      ? {
          name: editingLoan.name,
          amount: editingLoan.amount,
          paymentAmount: editingLoan.paymentAmount,
          frequency: editingLoan.frequency,
          startDate: editingLoan.startDate,
        }
      : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");
    if (form.amount <= 0) return setError("Total amount must be greater than 0");
    if (form.paymentAmount <= 0) return setError("Payment amount must be greater than 0");
    if (form.paymentAmount > form.amount) return setError("Payment amount cannot exceed total");
    if (!form.startDate) return setError("Start date is required");

    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingLoan) setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const numPayments = form.amount > 0 && form.paymentAmount > 0
    ? Math.ceil(form.amount / form.paymentAmount)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold text-gb-fg1">
        {editingLoan ? "Edit Loan" : "Add Loan"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
          placeholder="e.g. Car Loan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Total Amount ({currency})</label>
        <input
          type="number"
          value={form.amount || ""}
          onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
          className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Payment Amount ({currency})</label>
        <input
          type="number"
          value={form.paymentAmount || ""}
          onChange={(e) => setForm({ ...form, paymentAmount: parseFloat(e.target.value) || 0 })}
          className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        {numPayments > 0 && (
          <p className="text-xs text-gb-fg4 mt-1">
            {numPayments} payment{numPayments !== 1 ? "s" : ""}
            {form.amount % form.paymentAmount !== 0 && (
              <span> (last payment: {fmt(Math.round((form.amount % form.paymentAmount) * 100) / 100)})</span>
            )}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Frequency</label>
        <select
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
          className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Start Date</label>
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
        />
      </div>

      {error && <p className="text-sm text-gb-red">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 nb-btn rounded-sm bg-gb-blue px-4 py-2 text-sm font-bold text-gb-bg0 hover:nb-btn-press disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Check size={14} />
          {submitting ? "Saving..." : editingLoan ? "Update" : "Add Loan"}
        </button>
        {editingLoan && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="nb-btn rounded-sm bg-gb-bg0 px-4 py-2 text-sm font-bold text-gb-fg2 hover:nb-btn-press"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
