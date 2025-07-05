import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PortfolioData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioChartProps {
  data: PortfolioData[];
}

export const PortfolioChart = memo(({ data }: PortfolioChartProps) => {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

PortfolioChart.displayName = 'PortfolioChart';