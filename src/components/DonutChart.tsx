"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/colors";

interface DonutChartProps {
  loanTotal: number;
  billTotal: number;
  incomeTotal: number;
  /** Outer diameter in px — defaults to 120 */
  size?: number;
}

const CATEGORY_COLORS = [CHART_COLORS.loan, CHART_COLORS.bill, CHART_COLORS.income];

export default function DonutChart({ loanTotal, billTotal, incomeTotal, size = 120 }: DonutChartProps) {
  const expenseTotal = loanTotal + billTotal;
  const net = incomeTotal - expenseTotal;
  const total = loanTotal + billTotal + incomeTotal;

  if (total === 0) return null;

  const data = [
    { name: "Loans", value: loanTotal },
    { name: "Bills", value: billTotal },
    { name: "Income", value: incomeTotal },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      {/* Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="95%"
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry) => {
                const colorKey = entry.name === "Loans" ? 0 : entry.name === "Bills" ? 1 : 2;
                return <Cell key={entry.name} fill={CATEGORY_COLORS[colorKey]} />;
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
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
