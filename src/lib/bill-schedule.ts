import { addDays, addMonths, addYears, endOfMonth, getDate, format, min } from "date-fns";
import type { Bill, BillPayment, BillScheduleEntry } from "./types";

/**
 * Generate bill schedule entries from startDate to maxDate.
 * Every entry is independently payable (no sequential enforcement).
 */
export function getBillSchedule(bill: Bill, billPayments: BillPayment[], maxDate: Date): BillScheduleEntry[] {
  const paidByDate = new Map<string, number>();
  for (const p of billPayments) {
    if (p.billId === bill.id) {
      paidByDate.set(p.date, p.amount);
    }
  }

  const schedule: BillScheduleEntry[] = [];
  const start = new Date(bill.startDate + "T00:00:00");
  let offset = 0;

  while (true) {
    const current = dateAtOffset(start, offset, bill.frequency);
    if (current > maxDate) break;

    const dateStr = format(current, "yyyy-MM-dd");
    const paidAmount = paidByDate.get(dateStr) ?? null;

    schedule.push({
      date: dateStr,
      scheduledAmount: bill.amount,
      paid: paidAmount !== null,
      paidAmount,
    });

    offset++;
    if (offset > 10000) break; // safety
  }

  return schedule;
}

function dateAtOffset(start: Date, offset: number, frequency: string): Date {
  switch (frequency) {
    case "biweekly":
      return addDays(start, offset * 14);
    case "monthly": {
      const dayOfMonth = getDate(start);
      const next = addMonths(start, offset);
      const lastDay = endOfMonth(next);
      const target = new Date(next.getFullYear(), next.getMonth(), dayOfMonth);
      return min([target, lastDay]);
    }
    case "yearly": {
      const dayOfMonth = getDate(start);
      const next = addYears(start, offset);
      const lastDay = endOfMonth(next);
      const target = new Date(next.getFullYear(), next.getMonth(), dayOfMonth);
      return min([target, lastDay]);
    }
    default:
      return addMonths(start, offset);
  }
}
