export type Frequency = "daily" | "weekly" | "monthly";

export interface User {
  id: number;
  username: string;
  email: string | null;
  hasPassword: boolean;
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

export type BillFrequency = "once" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
export type BillType = "expense" | "income";

export interface Bill {
  id: number;
  name: string;
  amount: number;
  frequency: BillFrequency;
  type: BillType;
  startDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface BillInput {
  name: string;
  amount: number;
  frequency: BillFrequency;
  type: BillType;
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

// ── Savings ─────────────────────────────────────────────

export interface SavingsAccount {
  id: number;
  name: string;
  balance: number;
  createdAt: string;
}

export interface SavingsInput {
  name: string;
  balance: number;
}
