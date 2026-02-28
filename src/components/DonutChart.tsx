"use client";

import { PieChart, Pie, Cell, Tooltip, Sector, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/colors";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";

interface DonutChartProps {
  loanTotal: number;
  billTotal: number;
  incomeTotal: number;
  /** Outer diameter in px — defaults to 160 */
  size?: number;
}

const CATEGORY_COLORS = [CHART_COLORS.loan, CHART_COLORS.bill, CHART_COLORS.income];

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

export default function DonutChart({ loanTotal, billTotal, incomeTotal, size = 160 }: DonutChartProps) {
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
              shape={sectorShape}
            >
              {data.map((entry) => {
                const colorKey = entry.name === "Loans" ? 0 : entry.name === "Bills" ? 1 : 2;
                return <Cell key={entry.name} fill={CATEGORY_COLORS[colorKey]} />;
              })}
            </Pie>
            <Tooltip
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
                    }}
                  >
                    <span style={{ color: "var(--gb-fg1)" }}>
                      {item.name}: ₱{((item.value as number) ?? 0).toLocaleString()}
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
