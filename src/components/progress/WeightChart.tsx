import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { WeightEntry } from '../../types';

interface WeightChartProps {
  data: WeightEntry[];
  startWeight: number;
  targetWeight: number;
}

interface TooltipPayload {
  payload: { date: string; weightKg: number };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const dateStr = new Date(d.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
  return (
    <div className="bg-card border border-white/20 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-text-secondary text-xs">{dateStr}</p>
      <p className="text-white font-bold">{d.weightKg} kg</p>
    </div>
  );
}

export default function WeightChart({ data, startWeight, targetWeight }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-secondary text-sm">
        Aucune donnée de poids enregistrée
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: d.date,
    displayDate: new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
  }));

  const weights = data.map((d) => d.weightKg);
  const minWeight = Math.min(...weights, targetWeight) - 1;
  const maxWeight = Math.max(...weights, startWeight) + 1;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="displayDate"
          tick={{ fill: '#8E8E93', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minWeight, maxWeight]}
          tick={{ fill: '#8E8E93', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}kg`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={startWeight}
          stroke="#8E8E93"
          strokeDasharray="4 4"
          label={{ value: `Départ ${startWeight}kg`, fill: '#8E8E93', fontSize: 10, position: 'right' }}
        />
        <ReferenceLine
          y={targetWeight}
          stroke="#34C759"
          strokeDasharray="4 4"
          label={{ value: `Objectif ${targetWeight}kg`, fill: '#34C759', fontSize: 10, position: 'right' }}
        />
        <Line
          type="monotone"
          dataKey="weightKg"
          stroke="#FF6B35"
          strokeWidth={2.5}
          dot={{ fill: '#FF6B35', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#FF6B35' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
