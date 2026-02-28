"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { SavingsAccount, SavingsInput } from "@/lib/types";

interface SavingsFormProps {
  onSubmit: (input: SavingsInput) => Promise<void>;
  editingAccount?: SavingsAccount | null;
  onCancelEdit?: () => void;
}

const EMPTY_FORM: SavingsInput = { name: "", balance: 0 };

export default function SavingsForm({ onSubmit, editingAccount, onCancelEdit }: SavingsFormProps) {
  const [form, setForm] = useState<SavingsInput>(
    editingAccount
      ? { name: editingAccount.name, balance: editingAccount.balance }
      : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");
    if (form.balance < 0) return setError("Balance cannot be negative");

    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingAccount) setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold text-gb-fg1">
        {editingAccount ? "Edit Account" : "Add Savings Account"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Account Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-purple focus:ring-1 focus:ring-gb-purple outline-none"
          placeholder="e.g. BDO, BPI, GCash"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gb-fg2 mb-1">Current Balance (PHP)</label>
        <input
          type="number"
          value={form.balance || ""}
          onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
          className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-purple focus:ring-1 focus:ring-gb-purple outline-none"
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>

      {error && <p className="text-sm text-gb-red">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-md bg-gb-purple px-4 py-2 text-sm font-medium text-gb-bg0 hover:bg-gb-purple-dim disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Check size={14} />
          {submitting ? "Saving..." : editingAccount ? "Update" : "Add Account"}
        </button>
        {editingAccount && onCancelEdit && (
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
