import { useCurrency } from "@/lib/currency";
import type { LoanColor } from "@/lib/colors";

interface LoanIndicatorProps {
  name: string;
  scheduledAmount: number;
  paid: boolean;
  paidAmount: number | null;
  canPay: boolean;
  color: LoanColor;
  onClick?: () => void;
}

export default function LoanIndicator({
  name,
  scheduledAmount,
  paid,
  paidAmount,
  canPay,
  color,
  onClick,
}: LoanIndicatorProps) {
  const { symbol } = useCurrency();
  const displayAmount = paid ? paidAmount! : scheduledAmount;
  const isPartial = paid && paidAmount !== null && paidAmount < scheduledAmount;
  const interactive = paid || canPay;

  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      className={`w-full text-left truncate rounded px-1 py-0.5 text-[10px] leading-tight border ${
        paid
          ? `${color.bg} ${color.border} opacity-70 cursor-pointer`
          : canPay
          ? `${color.bg} ${color.text} ${color.border} cursor-pointer`
          : `${color.bg} ${color.border} opacity-40 cursor-default`
      }`}
      title={
        paid
          ? `${name}: ${symbol}${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (paid)`
          : canPay
          ? `${name}: ${symbol}${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} — click to pay`
          : `${name}: ${symbol}${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} — pay previous dates first`
      }
    >
      {paid && <span className="mr-0.5">&#10003;</span>}
      <span className={`font-medium ${paid ? "line-through" : ""}`}>
        {symbol}{displayAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </span>
      {isPartial && (
        <span className="opacity-60">/{symbol}{scheduledAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
      )}
      <span className={`ml-0.5 ${paid ? "opacity-50" : "opacity-70"}`}>{name}</span>
    </button>
  );
}
