import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import type { DayPayment } from "./CalendarDayCell";
import DonutChart from "./DonutChart";

function fmtDate(d: string) { return format(parseISO(d), "MMM d, yyyy"); }

interface RangeSummaryEntry {
  date: string;
  payment: DayPayment;
}

interface RangeSummaryDialogProps {
  startDate: string;
  endDate: string;
  paymentMap: Map<string, DayPayment[]>;
  onClose: () => void;
}

export default function RangeSummaryDialog({ startDate, endDate, paymentMap, onClose }: RangeSummaryDialogProps) {
  // Collect all payments in range, chronologically
  const entries: RangeSummaryEntry[] = [];
  const current = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  while (current <= end) {
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    const dayPayments = paymentMap.get(dateStr) ?? [];
    for (const p of dayPayments) {
      entries.push({ date: dateStr, payment: p });
    }
    current.setDate(current.getDate() + 1);
  }

  // Category totals
  let loanTotal = 0;
  let billTotal = 0;
  let incomeTotal = 0;
  for (const e of entries) {
    if (e.payment.type === "loan") loanTotal += e.payment.scheduledAmount;
    else if (e.payment.type === "bill") billTotal += e.payment.scheduledAmount;
    else if (e.payment.type === "income") incomeTotal += e.payment.scheduledAmount;
  }

  const totalPaid = entries
    .filter((e) => e.payment.paid)
    .reduce((sum, e) => sum + (e.payment.paidAmount ?? e.payment.scheduledAmount), 0);
  const paidCount = entries.filter((e) => e.payment.paid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-gb-fg0/40" />
      <div
        className="relative bg-gb-bg0 nb-card rounded-sm w-96 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gb-bg2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gb-fg0 text-sm">
              {startDate === endDate ? fmtDate(startDate) : `${fmtDate(startDate)} — ${fmtDate(endDate)}`}
            </h3>
            <button
              onClick={onClose}
              className="text-gb-fg4 hover:text-gb-fg2"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-gb-fg3">
            <span>{entries.length} item{entries.length !== 1 ? "s" : ""}</span>
            <span>{paidCount} paid</span>
          </div>
        </div>

        {/* Donut chart */}
        {entries.length > 0 && (
          <div className="border-b border-gb-bg2">
            <DonutChart loanTotal={loanTotal} billTotal={billTotal} incomeTotal={incomeTotal} />
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {entries.length === 0 ? (
            <div className="text-sm text-gb-fg4 text-center py-8">
              No payments in this range.
            </div>
          ) : (
            <div className="space-y-1">
              {entries.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                    e.payment.paid ? "opacity-60" : ""
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${e.payment.color.dot}`} />
                  <span className="text-xs text-gb-fg4 shrink-0 w-24">{fmtDate(e.date)}</span>
                  <span className={`flex-1 truncate text-gb-fg1 ${e.payment.paid ? "line-through" : ""}`}>
                    {e.payment.name}
                  </span>
                  <span className={`shrink-0 font-medium tabular-nums ${e.payment.paid ? "text-gb-fg4" : "text-gb-fg1"}`}>
                    {e.payment.type === "income" ? "+" : ""}₱{e.payment.scheduledAmount.toLocaleString()}
                  </span>
                  {e.payment.paid && (
                    <span className="text-[10px] text-gb-aqua-dim shrink-0">&#10003;</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer totals */}
        <div className="px-4 py-3 border-t border-gb-bg2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gb-fg3">Total expenses</span>
            <span className="font-semibold text-gb-fg0">₱{(loanTotal + billTotal).toLocaleString()}</span>
          </div>
          {incomeTotal > 0 && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gb-fg4">Total income</span>
              <span className="text-gb-green">+₱{incomeTotal.toLocaleString()}</span>
            </div>
          )}
          {totalPaid > 0 && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gb-fg4">Already paid</span>
              <span className="text-gb-aqua-dim">₱{totalPaid.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
