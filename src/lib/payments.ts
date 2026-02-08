import {
  addDays,
  addMonths,
  endOfMonth,
  getDate,
  format,
  min,
} from "date-fns";
import type { Loan, Payment, ScheduleEntry } from "./types";

/**
 * Compute the full payment schedule for a loan, accounting for actual payments.
 *
 * Walks forward from start_date generating dates by frequency.
 * For each date:
 *   - If an actual payment exists: mark paid, deduct actual amount from balance
 *   - If no payment: scheduled for min(paymentAmount, remaining), deduct for projection
 * Stops when projected balance reaches 0.
 */
export function getPaymentSchedule(loan: Loan, payments: Payment[]): ScheduleEntry[] {
  const paidByDate = new Map<string, number>();
  for (const p of payments) {
    if (p.loanId === loan.id) {
      paidByDate.set(p.date, (paidByDate.get(p.date) ?? 0) + p.amount);
    }
  }

  let balance = loan.amount;
  const schedule: ScheduleEntry[] = [];
  let offset = 0;
  const start = new Date(loan.startDate + "T00:00:00");

  while (balance > 0.005) {
    const current = dateAtOffset(start, offset, loan.frequency);
    const dateStr = format(current, "yyyy-MM-dd");
    const paidAmount = paidByDate.get(dateStr) ?? null;
    const scheduledAmount = Math.round(Math.min(loan.paymentAmount, balance) * 100) / 100;

    schedule.push({ date: dateStr, scheduledAmount, paid: paidAmount !== null, paidAmount, canPay: false });

    const deduction = paidAmount !== null ? paidAmount : scheduledAmount;
    balance = Math.round((balance - deduction) * 100) / 100;
    offset++;

    if (offset > 10000) break; // safety
  }

  // Sequential enforcement: only the first unpaid entry can be paid
  for (const entry of schedule) {
    if (!entry.paid) {
      entry.canPay = true;
      break;
    }
  }

  return schedule;
}

function dateAtOffset(start: Date, offset: number, frequency: string): Date {
  switch (frequency) {
    case "daily":
      return addDays(start, offset);
    case "weekly":
      return addDays(start, offset * 7);
    case "monthly": {
      const dayOfMonth = getDate(start);
      const next = addMonths(start, offset);
      const lastDay = endOfMonth(next);
      const target = new Date(next.getFullYear(), next.getMonth(), dayOfMonth);
      return min([target, lastDay]);
    }
    default:
      return addDays(start, offset);
  }
}

/** Computed end date (last payment date) */
export function getEndDate(loan: Loan, payments: Payment[]): string | null {
  const schedule = getPaymentSchedule(loan, payments);
  if (schedule.length === 0) return null;
  return schedule[schedule.length - 1].date;
}

/** Total paid so far for a loan */
export function getTotalPaid(loan: Loan, payments: Payment[]): number {
  return payments
    .filter((p) => p.loanId === loan.id)
    .reduce((sum, p) => sum + p.amount, 0);
}
