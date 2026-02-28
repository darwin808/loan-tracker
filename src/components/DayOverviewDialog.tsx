import { X } from "lucide-react";
import LoanIndicator from "./LoanIndicator";
import type { DayPayment } from "./CalendarDayCell";

interface DayOverviewDialogProps {
  date: string;
  payments: DayPayment[];
  onPaymentClick: (payment: DayPayment) => void;
  onClose: () => void;
}

export default function DayOverviewDialog({ date, payments, onPaymentClick, onClose }: DayOverviewDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-gb-fg0/40" />
      <div
        className="relative bg-gb-bg0 nb-card rounded-sm p-4 w-80 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gb-fg1 text-sm">{date}</h3>
          <button
            onClick={onClose}
            className="text-gb-fg4 hover:text-gb-fg2"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {payments.map((p, i) => (
            <LoanIndicator
              key={i}
              name={p.name}
              scheduledAmount={p.scheduledAmount}
              paid={p.paid}
              paidAmount={p.paidAmount}
              canPay={p.canPay}
              color={p.color}
              onClick={(p.paid || p.canPay) ? () => onPaymentClick(p) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
