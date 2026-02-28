export type Frequency = "daily" | "weekly" | "monthly";

export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface Loan {
  id: number;
  name: string;
  amount: number;
  paymentAmount: number;
  frequency: Frequency;
  startDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface LoanInput {
  name: string;
  amount: number;
  paymentAmount: number;
  frequency: Frequency;
  startDate: string;
}

export interface Payment {
  id: number;
  loanId: number;
  date: string;
  amount: number;
  createdAt: string;
}

export interface ScheduleEntry {
  date: string;
  scheduledAmount: number;
  paid: boolean;
  paidAmount: number | null;
  canPay: boolean; // true only for the first unpaid entry (sequential enforcement)
}

// ── Bills ──────────────────────────────────────────────────

export type BillFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export interface Bill {
  id: number;
  name: string;
  amount: number;
  frequency: BillFrequency;
  startDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface BillInput {
  name: string;
  amount: number;
  frequency: BillFrequency;
  startDate: string;
}

export interface BillPayment {
  id: number;
  billId: number;
  date: string;
  amount: number;
  createdAt: string;
}

export interface BillScheduleEntry {
  date: string;
  scheduledAmount: number;
  paid: boolean;
  paidAmount: number | null;
}
