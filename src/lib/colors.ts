export interface LoanColor {
  dot: string;
  bg: string;
  text: string;
  border: string;
}

const LOAN_COLOR: LoanColor = { dot: "bg-gb-blue", bg: "bg-gb-blue-bg", text: "text-gb-blue-dim", border: "border-gb-blue" };
const BILL_COLOR: LoanColor = { dot: "bg-gb-orange", bg: "bg-gb-orange-bg", text: "text-gb-orange-dim", border: "border-gb-orange" };
const INCOME_COLOR: LoanColor = { dot: "bg-gb-green", bg: "bg-gb-green-bg", text: "text-gb-green-dim", border: "border-gb-green" };

export function getLoanColor(_index: number): LoanColor {
  return LOAN_COLOR;
}

export function getBillColor(_billId: number): LoanColor {
  return BILL_COLOR;
}

export function getIncomeColor(): LoanColor {
  return INCOME_COLOR;
}

// Hex values matching CSS variables in globals.css — used by Recharts/inline styles
export const CHART_COLORS = {
  loan: "var(--color-gb-blue)",
  bill: "var(--color-gb-orange)",
  income: "var(--color-gb-green)",
  red: "var(--color-gb-red)",
};
