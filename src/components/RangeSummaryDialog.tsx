import { format, parseISO } from "date-fns";
import type { DayPayment } from "./CalendarDayCell";

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

// Gruvbox hex values for conic-gradient (can't use Tailwind classes in inline styles)
const COLORS = {
  loan: "#458588",   // gb-blue
  bill: "#d79921",   // gb-orange (yellow in gruvbox)
  income: "#7a9a19", // gb-green
  empty: "#3c3836",  // gb-bg1
};

function DonutChart({ loanTotal, billTotal, incomeTotal }: { loanTotal: number; billTotal: number; incomeTotal: number }) {
  const expenseTotal = loanTotal + billTotal;
  const net = incomeTotal - expenseTotal;
  const total = loanTotal + billTotal + incomeTotal;

  if (total === 0) return null;

  // Build conic-gradient segments
  const segments: string[] = [];
  let cursor = 0;

  const addSegment = (color: string, amount: number) => {
    if (amount <= 0) return;
    const pct = (amount / total) * 100;
    segments.push(`${color} ${cursor}% ${cursor + pct}%`);
    cursor += pct;
  };

  addSegment(COLORS.loan, loanTotal);
  addSegment(COLORS.bill, billTotal);
  addSegment(COLORS.income, incomeTotal);

  const gradient = `conic-gradient(${segments.join(", ")})`;

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      {/* Donut */}
      <div
        className="relative w-28 h-28 rounded-full"
        style={{ background: gradient }}
      >
        {/* Inner cutout */}
        <div className="absolute inset-3 rounded-full bg-gb-bg0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-sm font-bold ${net >= 0 ? "text-gb-green" : "text-gb-red"}`}>
              {net >= 0 ? "+" : ""}₱{Math.abs(net).toLocaleString()}
            </div>
            <div className="text-[10px] text-gb-fg4">net</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        {loanTotal > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gb-blue" />
            <span className="text-gb-fg3">Loans</span>
            <span className="font-medium text-gb-fg1">₱{loanTotal.toLocaleString()}</span>
          </span>
        )}
        {billTotal > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gb-orange" />
            <span className="text-gb-fg3">Bills</span>
            <span className="font-medium text-gb-fg1">₱{billTotal.toLocaleString()}</span>
          </span>
        )}
        {incomeTotal > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gb-green" />
            <span className="text-gb-fg3">Income</span>
            <span className="font-medium text-gb-fg1">₱{incomeTotal.toLocaleString()}</span>
          </span>
        )}
      </div>
    </div>
  );
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
      <div className="absolute inset-0 bg-gb-fg0/30" />
      <div
        className="relative bg-gb-bg0 rounded-lg border border-gb-bg3 shadow-lg w-96 max-h-[80vh] flex flex-col"
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
              className="text-gb-fg4 hover:text-gb-fg2 text-lg leading-none"
            >
              &times;
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
