"use client";

import { PieChart, Pie, Cell, Tooltip, Sector, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/colors";
import { useCurrency } from "@/lib/currency";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";

interface DonutChartProps {
  loanTotal: number;
  billTotal: number;
  incomeTotal: number;
  /** Outer diameter in px — defaults to 160 */
  size?: number;
}

function sectorShape(props: PieSectorShapeProps) {
  const { isActive, cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={isActive ? innerRadius - 2 : innerRadius}
      outerRadius={isActive ? outerRadius + 4 : outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

const SLICE_COLORS: Record<string, string> = {
  Loans: CHART_COLORS.loan,
  Bills: CHART_COLORS.bill,
  Remaining: CHART_COLORS.income,
};

export default function DonutChart({ loanTotal, billTotal, incomeTotal, size = 160 }: DonutChartProps) {
  const { fmt } = useCurrency();
  const expenseTotal = loanTotal + billTotal;
  const net = incomeTotal - expenseTotal;

  // Nothing to show if no income and no expenses
  if (incomeTotal === 0 && expenseTotal === 0) return null;

  // Full circle = income (or total expenses if overspent)
  // Slices: Loans, Bills, Remaining (net > 0)
  // When overspent (net < 0), only show loans + bills filling the whole circle
  const data = [
    { name: "Loans", value: loanTotal },
    { name: "Bills", value: billTotal },
    ...(net > 0 ? [{ name: "Remaining", value: net }] : []),
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

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
              shape={sectorShape}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={SLICE_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              position={{ x: size / 2, y: -10 }}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const item = payload[0];
                return (
                  <div
                    style={{
                      backgroundColor: "var(--gb-bg0)",
                      border: "1px solid var(--gb-bg3)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span style={{ color: "var(--gb-fg1)" }}>
                      {item.name}: {fmt((item.value as number) ?? 0)}
                    </span>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className={`text-sm font-bold ${net >= 0 ? "text-gb-green" : "text-gb-red"}`}>
              {net >= 0 ? "+" : ""}{fmt(Math.abs(net))}
            </div>
            <div className="text-[10px] text-gb-fg4">net</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        {loanTotal > 0 && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-gb-blue shrink-0" />
            <span className="text-gb-fg3">Loans</span>
            <span className="font-medium text-gb-fg1">{fmt(loanTotal)}</span>
          </span>
        )}
        {billTotal > 0 && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-gb-orange shrink-0" />
            <span className="text-gb-fg3">Bills</span>
            <span className="font-medium text-gb-fg1">{fmt(billTotal)}</span>
          </span>
        )}
        {net > 0 && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-gb-green shrink-0" />
            <span className="text-gb-fg3">Left</span>
            <span className="font-medium text-gb-fg1">{fmt(net)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
