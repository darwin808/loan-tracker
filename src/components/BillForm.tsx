"use client";

import { useState } from "react";
import type { Bill, BillInput, BillFrequency } from "@/lib/types";

interface BillFormProps {
  onSubmit: (input: BillInput) => Promise<void>;
  editingBill?: Bill | null;
  onCancelEdit?: () => void;
}

const EMPTY_FORM: BillInput = {
  name: "",
  amount: 0,
  frequency: "monthly",
  startDate: "",
};

export default function BillForm({ onSubmit, editingBill, onCancelEdit }: BillFormProps) {
  const [form, setForm] = useState<BillInput>(
    editingBill
      ? {
          name: editingBill.name,
          amount: editingBill.amount,
          frequency: editingBill.frequency,
          startDate: editingBill.startDate,
        }
      : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");
    if (form.amount <= 0) return setError("Amount must be greater than 0");
    if (!form.startDate) return setError("Start date is required");

    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingBill) setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold text-gb-fg1">
        {editingBill ? "Edit Bill" : "Add Bill"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue focus:ring-1 focus:ring-gb-blue outline-none"
          placeholder="e.g. Netflix, Electricity"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Amount (PHP)</label>
        <input
          type="number"
          value={form.amount || ""}
          onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
          className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue focus:ring-1 focus:ring-gb-blue outline-none"
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Frequency</label>
        <select
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value as BillFrequency })}
          className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue focus:ring-1 focus:ring-gb-blue outline-none"
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Every 2 Weeks</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Start Date</label>
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue focus:ring-1 focus:ring-gb-blue outline-none"
        />
      </div>

      {error && <p className="text-sm text-gb-red">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-md bg-gb-blue px-4 py-2 text-sm font-medium text-gb-bg0 hover:bg-gb-blue-dim disabled:opacity-50"
        >
          {submitting ? "Saving..." : editingBill ? "Update" : "Add Bill"}
        </button>
        {editingBill && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-md border border-gb-bg3 px-4 py-2 text-sm font-medium text-gb-fg2 hover:bg-gb-bg1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
