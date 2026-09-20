'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import { Loader2, Activity } from 'lucide-react';
import type { SectorImpactPoint } from '@/lib/types';
import { SECTOR_LABELS, type Sector } from '@/lib/types';

interface SectorChartProps {
  data?: SectorImpactPoint[];
  loading?: boolean;
}

function barColor(impact: number): string {
  if (impact >= 75) return 'hsl(var(--risk-critical))';
  if (impact >= 50) return 'hsl(var(--risk-high))';
  if (impact >= 25) return 'hsl(var(--risk-moderate))';
  return 'hsl(var(--risk-low))';
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  const value = typeof point.value === 'number' ? point.value : 0;
  return (
    <div className="rounded border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <span className="font-medium text-foreground">
        {point.payload.sector}
      </span>
      <span className="ml-2 font-mono tabular-nums text-primary">{value}%</span>
    </div>
  );
}

export function SectorChart({ data = [], loading = false }: SectorChartProps) {
  return (
    <section className="flex h-full flex-col rounded-md border border-border bg-card/60">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            Sector Impact
          </h3>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Projected exposure across connected sectors
        </p>
      </div>
      <div className="flex-1 p-3">
        {loading ? (
          <div className="flex h-[220px] items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating sector exposure…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
            Run an analysis to see sector impact.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
              barCategoryGap="18%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(222 22% 18%)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'hsl(220 14% 62%)', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(222 22% 18%)' }}
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="sector"
                tick={{ fill: 'hsl(220 14% 62%)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'hsl(222 22% 14% / 0.5)' }}
              />
              <Bar dataKey="impact" radius={[0, 3, 3, 0]} barSize={18}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.impact)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export function toSectorImpactPoints(
  sectorImpact: { sector: Sector; avg_risk: number }[]
): SectorImpactPoint[] {
  return sectorImpact.map((s) => ({
    sector: SECTOR_LABELS[s.sector],
    impact: Math.round(s.avg_risk * 100),
  }));
}
