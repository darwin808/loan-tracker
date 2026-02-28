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
      outerRadius={isActive ? outerRadius + 6 : outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

const SLICE_META: Record<string, { color: string; label: string; dotClass: string }> = {
  Loans: { color: CHART_COLORS.loan, label: "Loans", dotClass: "bg-gb-blue" },
  Bills: { color: CHART_COLORS.bill, label: "Bills", dotClass: "bg-gb-orange" },
  Remaining: { color: CHART_COLORS.income, label: "Remaining", dotClass: "bg-gb-green" },
};

export default function DonutChart({ loanTotal, billTotal, incomeTotal, size = 160 }: DonutChartProps) {
  const { fmt } = useCurrency();
  const expenseTotal = loanTotal + billTotal;
  const net = incomeTotal - expenseTotal;
  const total = Math.max(incomeTotal, expenseTotal);

  if (incomeTotal === 0 && expenseTotal === 0) return null;

  const data = [
    { name: "Loans", value: loanTotal },
    { name: "Bills", value: billTotal },
    ...(net > 0 ? [{ name: "Remaining", value: net }] : []),
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  const isMini = size < 200;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="92%"
              dataKey="value"
              stroke="var(--color-gb-bg1)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              shape={sectorShape}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={SLICE_META[entry.name].color} />
              ))}
            </Pie>
            <Tooltip
              position={{ x: size / 2, y: -10 }}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const item = payload[0];
                const pct = total > 0 ? Math.round(((item.value as number) / total) * 100) : 0;
                return (
                  <div className="nb-card-sm rounded-sm bg-gb-bg0 px-3 py-2 text-xs"
                    style={{ transform: "translateX(-50%)" }}
                  >
                    <span className="font-bold text-gb-fg1">
                      {item.name}: {fmt((item.value as number) ?? 0)}
                    </span>
                    <span className="text-gb-fg4 ml-1">({pct}%)</span>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className={`${isMini ? "text-sm" : "text-xl"} font-bold ${net >= 0 ? "text-gb-green" : "text-gb-red"}`}>
              {net >= 0 ? "+" : ""}{fmt(Math.abs(net))}
            </div>
            <div className={`${isMini ? "text-[9px]" : "text-xs"} text-gb-fg4`}>
              {net >= 0 ? "remaining" : "over budget"}
            </div>
            {!isMini && incomeTotal > 0 && (
              <div className="text-[10px] text-gb-fg4 mt-0.5">
                of {fmt(incomeTotal)} income
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend with percentage bars */}
      <div className={`w-full ${isMini ? "max-w-[200px]" : "max-w-[280px]"} space-y-2`}>
        {data.map((entry) => {
          const meta = SLICE_META[entry.name];
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <span className={`${meta.dotClass} h-2.5 w-2.5 rounded-sm shrink-0`} />
              <span className="text-gb-fg3 w-16 shrink-0">{meta.label}</span>
              <div className="flex-1 h-2 bg-gb-bg2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${meta.dotClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-bold text-gb-fg1 w-14 text-right shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
