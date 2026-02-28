export interface LoanColor {
  dot: string;
  bg: string;
  text: string;
  border: string;
}

const LOAN_COLOR: LoanColor = { dot: "bg-gb-blue", bg: "bg-gb-blue-bg", text: "text-gb-blue-dim", border: "border-gb-blue" };
const BILL_COLOR: LoanColor = { dot: "bg-gb-orange", bg: "bg-gb-orange-bg", text: "text-gb-orange-dim", border: "border-gb-orange" };

export function getLoanColor(_index: number): LoanColor {
  return LOAN_COLOR;
}

export function getBillColor(_billId: number): LoanColor {
  return BILL_COLOR;
}
