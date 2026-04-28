"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PayoutRecord = {
  id?: string | null;
  month: number;
  year: number;
  label: string;
  firstSale: number;
  renewal: number;
  slabBonus: number;
  total: number;
  status: string;
  paidAt?: string | Date | null;
};

type PayoutHistoryProps = {
  history: PayoutRecord[];
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function shortLabel(label: string) {
  const [month, year] = label.split(" ");
  return `${month.slice(0, 3)} ${year}`;
}

function statusClass(status: string) {
  return status.toLowerCase() === "paid"
    ? "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]"
    : "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]";
}

export function PayoutHistory({ history }: PayoutHistoryProps) {
  const chartData = [...history]
    .reverse()
    .map((item) => ({ ...item, chartLabel: shortLabel(item.label) }));

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5 text-white">
      <h2 className="font-heading text-lg font-bold">Payout history</h2>

      <div className="mt-5 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="chartLabel"
              tick={{ fill: "#8b8799", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#8b8799", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#0e0e13",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "white",
              }}
              formatter={(value) => money(Number(value))}
            />
            <Bar dataKey="firstSale" stackId="earnings" fill="#22D9A0" radius={[0, 0, 0, 0]} />
            <Bar dataKey="renewal" stackId="earnings" fill="#7C6FFF" radius={[0, 0, 0, 0]} />
            <Bar dataKey="slabBonus" stackId="earnings" fill="#F5A623" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            <tr>
              <th className="py-3">Month</th>
              <th>First sale</th>
              <th>Renewal</th>
              <th>Slab</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={`${item.month}-${item.year}`} className="border-t border-white/10">
                <td className="py-3 font-semibold text-white">{item.label}</td>
                <td className="text-zinc-400">{money(item.firstSale)}</td>
                <td className="text-zinc-400">{money(item.renewal)}</td>
                <td className="text-zinc-400">{money(item.slabBonus)}</td>
                <td className="font-bold text-white">{money(item.total)}</td>
                <td>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
