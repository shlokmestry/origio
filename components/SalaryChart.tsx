"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CountryData } from "@/types";

interface SalaryChartProps {
  data: CountryData;
  currency: string;
}

export default function SalaryChart({ data, currency }: SalaryChartProps) {
  const chartData = [
    { role: "Software Eng.", salary: data.salarySoftwareEngineer, fullRole: "Software Engineer" },
    { role: "Nurse", salary: data.salaryNurse, fullRole: "Nurse" },
    { role: "Teacher", salary: data.salaryTeacher, fullRole: "Teacher" },
    { role: "Accountant", salary: data.salaryAccountant, fullRole: "Accountant" },
    { role: "Marketing Mgr.", salary: data.salaryMarketingManager, fullRole: "Marketing Manager" },
  ];

  const colors = ["#00d4c8", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-panel rounded-lg px-3 py-2 shadow-xl">
          <p className="text-sm font-medium text-text-primary">{item.fullRole}</p>
          <p className="text-sm text-accent font-heading font-bold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency,
              maximumFractionDigits: 0,
            }).format(item.salary)}/yr
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <XAxis dataKey="role" tick={{ fill: "#8888a0", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
          <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => Math.round(v / 1000) + "k"} />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="salary" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i]} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}