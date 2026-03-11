"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, List } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import type { BillPaymentItem } from "@/lib/types";

interface BreakdownPanelProps {
  billId: number;
  date: string;
}

export default function BreakdownPanel({ billId, date }: BreakdownPanelProps) {
  const { fmt, symbol, currency } = useCurrency();
  const [items, setItems] = useState<BillPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/bill-payment-items?billId=${billId}&date=${date}`);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [billId, date]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!description.trim() || !amt || amt <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bill-payment-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, date, description: description.trim(), amount: amt }),
      });
      if (res.ok) {
        setDescription("");
        setAmount("");
        setShowForm(false);
        await fetchItems();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    await fetch(`/api/bill-payment-items?id=${itemId}`, { method: "DELETE" });
    await fetchItems();
  };

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  if (loading) {
    return (
      <div className="text-xs text-gb-fg4 pt-2 border-t border-gb-bg2 mt-3">
        Loading breakdown...
      </div>
    );
  }

  return (
    <div className="pt-2 border-t border-gb-bg2 mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gb-fg3 flex items-center gap-1">
          <List size={12} />
          Breakdown
        </span>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-[10px] text-gb-blue hover:text-gb-blue-dim flex items-center gap-0.5"
          >
            <Plus size={10} />
            Add
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-1 mb-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between group text-xs bg-gb-bg1 rounded-sm px-2 py-1.5"
            >
              <span className="text-gb-fg2 truncate mr-2">{item.description}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-gb-fg1 font-medium">{fmt(item.amount)}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-gb-fg4 hover:text-gb-red opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between text-xs px-2 pt-1 border-t border-gb-bg2">
            <span className="text-gb-fg4">Total</span>
            <span className="font-medium text-gb-fg1">{fmt(total)}</span>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm && (
        <p className="text-[10px] text-gb-fg4 mb-1">No breakdown items yet.</p>
      )}

      {showForm && (
        <div className="space-y-1.5 bg-gb-bg1 rounded-sm p-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Groceries"
            className="w-full nb-input rounded-sm bg-gb-bg0 px-2 py-1.5 text-xs text-gb-fg1 focus:border-gb-blue outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${currency})`}
            className="w-full nb-input rounded-sm bg-gb-bg0 px-2 py-1.5 text-xs text-gb-fg1 focus:border-gb-blue outline-none"
            min="0"
            step="0.01"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleAdd}
              disabled={submitting || !description.trim() || !parseFloat(amount)}
              className="flex-1 nb-btn rounded-sm bg-gb-blue px-2 py-1.5 text-[10px] font-bold text-gb-bg0 hover:nb-btn-press disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Item"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setDescription("");
                setAmount("");
              }}
              className="nb-btn rounded-sm bg-gb-bg0 px-2 py-1.5 text-[10px] font-bold text-gb-fg2 hover:nb-btn-press"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
