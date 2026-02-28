export interface LoanColor {
  dot: string;
  bg: string;
  text: string;
  border: string;
}

// Vibrant Gruvbox accents — pre-mixed bg colors for visibility on cream background
const COLORS: LoanColor[] = [
  { dot: "bg-gb-blue", bg: "bg-gb-blue-bg", text: "text-gb-blue-dim", border: "border-gb-blue" },
  { dot: "bg-gb-red", bg: "bg-gb-red-bg", text: "text-gb-red-dim", border: "border-gb-red" },
  { dot: "bg-gb-aqua", bg: "bg-gb-aqua-bg", text: "text-gb-aqua-dim", border: "border-gb-aqua" },
  { dot: "bg-gb-orange", bg: "bg-gb-orange-bg", text: "text-gb-orange-dim", border: "border-gb-orange" },
  { dot: "bg-gb-purple", bg: "bg-gb-purple-bg", text: "text-gb-purple-dim", border: "border-gb-purple" },
  { dot: "bg-gb-yellow", bg: "bg-gb-yellow-bg", text: "text-gb-yellow-dim", border: "border-gb-yellow" },
  { dot: "bg-gb-green", bg: "bg-gb-green-bg", text: "text-gb-green-dim", border: "border-gb-green" },
  { dot: "bg-gb-gray", bg: "bg-gb-gray-bg", text: "text-gb-fg2", border: "border-gb-gray" },
];

export function getLoanColor(index: number): LoanColor {
  return COLORS[index % COLORS.length];
}

export function getBillColor(billId: number): LoanColor {
  return COLORS[(billId + 4) % COLORS.length];
}
