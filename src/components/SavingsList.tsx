"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SavingsAccount } from "@/lib/types";

interface SavingsListProps {
  accounts: SavingsAccount[];
  onEdit: (account: SavingsAccount) => void;
  onDelete: (id: number) => void;
}

export default function SavingsList({ accounts, onEdit, onDelete }: SavingsListProps) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  if (accounts.length === 0) {
    return (
      <div className="text-sm text-gb-fg4 text-center py-8">
        No savings accounts yet.
      </div>
    );
  }

  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gb-fg1">Your Savings</h2>
        <span className="text-sm font-medium text-gb-purple">
          ₱{total.toLocaleString()}
        </span>
      </div>
      {accounts.map((account) => (
        <div
          key={account.id}
          className="relative rounded-md border-l-4 border-gb-purple bg-gb-bg0 shadow-sm cursor-pointer hover:bg-gb-bg1 transition-colors"
          onClick={() => onEdit(account)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingId(account.id);
            }}
            className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded text-gb-fg4 hover:text-gb-red hover:bg-gb-red-bg text-sm leading-none"
            title="Delete account"
          >
            <X size={12} />
          </button>
          <div className="px-3 py-2.5 pr-7">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gb-fg0 text-sm">{account.name}</span>
              <span className="font-semibold text-gb-fg1 text-sm">
                ₱{account.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {confirmingId === account.id && (
            <div
              className="absolute inset-0 bg-gb-bg0/95 rounded-md flex items-center justify-center gap-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm text-gb-fg2">Delete?</span>
              <button
                onClick={() => { onDelete(account.id); setConfirmingId(null); }}
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
      ))}
    </div>
  );
}
