import React, { useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, Legend,
  ComposedChart, Treemap, Brush,
} from 'recharts';
import { Download } from 'lucide-react';

const PALETTE = ['#6366f1', '#f472b6', '#22d3ee', '#34d399', '#fbbf24', '#f97316', '#a78bfa', '#ef4444'];

const tooltipStyle = {
  contentStyle: { backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' },
  itemStyle: { color: '#f8fafc' },
};

const axisProps = {
  stroke: '#52525b', fontSize: 10, tickLine: false, axisLine: false,
};

// Extract all numeric keys from data (excluding 'name')
function getSeriesKeys(data: Record<string, unknown>[]): string[] {
  if (!data.length) return ['value'];
  const keys = new Set<string>();
  for (const d of data) {
    for (const [k, v] of Object.entries(d)) {
      if (k !== 'name' && typeof v === 'number') keys.add(k);
    }
  }
  return keys.size ? Array.from(keys) : ['value'];
}

export const ChartComponent = ({ type = 'BAR', data, title, color = '#6366f1', series, colors, zoomable }: {
  type?: string;
  data?: Record<string, unknown>[];
  title?: string;
  color?: string;
  series?: string[];
  colors?: string[];
  zoomable?: boolean;
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const chartData = data ?? [];
  const seriesKeys = series ?? getSeriesKeys(chartData);
  const seriesColors = colors ?? PALETTE;
  const getColor = (i: number) => seriesColors[i % seriesColors.length] || color;

  // Toggle series visibility on legend click
  const handleLegendClick = useCallback((entry: { dataKey?: string; value?: string }) => {
    const key = entry.dataKey ?? entry.value ?? '';
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  // CSV export
  const handleExportCsv = useCallback(() => {
    if (!chartData.length) return;
    const headers = Object.keys(chartData[0]);
    const csv = [headers.join(','), ...chartData.map(row => headers.map(h => row[h] ?? '').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title ?? 'chart'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chartData, title]);

  const visibleKeys = seriesKeys.filter(k => !hiddenSeries.has(k));
  const showBrush = (zoomable ?? chartData.length > 10) && ['BAR', 'LINE', 'AREA', 'COMPOSED', 'MIXED'].includes(type.toUpperCase());
  const legendProps = seriesKeys.length > 1 ? {
    wrapperStyle: { fontSize: 11, color: '#94a3b8', cursor: 'pointer' },
    onClick: handleLegendClick,
    formatter: (value: string) => (
      <span style={{ color: hiddenSeries.has(value) ? '#475569' : '#94a3b8', textDecoration: hiddenSeries.has(value) ? 'line-through' : 'none' }}>{value}</span>
    ),
  } : undefined;

  const renderChart = () => {
    switch (type.toUpperCase()) {
      case 'LINE':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" {...axisProps} dy={10} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} cursor={{ stroke: '#27272a', strokeWidth: 1 }} />
            {legendProps && <Legend {...legendProps} />}
            {seriesKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={getColor(i)} strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: getColor(i), stroke: '#09090b', strokeWidth: 2 }}
                hide={hiddenSeries.has(key)} />
            ))}
            {showBrush && <Brush dataKey="name" height={20} stroke="#6366f1" fill="#09090b" travellerWidth={8} />}
          </LineChart>
        );

      case 'AREA':
        return (
          <AreaChart data={chartData}>
            <defs>
              {seriesKeys.map((key, i) => (
                <linearGradient key={key} id={`areaFill-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getColor(i)} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={getColor(i)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" {...axisProps} dy={10} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            {legendProps && <Legend {...legendProps} />}
            {seriesKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={getColor(i)} strokeWidth={2}
                fillOpacity={1} fill={`url(#areaFill-${i})`} hide={hiddenSeries.has(key)} />
            ))}
            {showBrush && <Brush dataKey="name" height={20} stroke="#6366f1" fill="#09090b" travellerWidth={8} />}
          </AreaChart>
        );

      case 'PIE':
      case 'DONUT': {
        const isDonut = type.toUpperCase() === 'DONUT';
        return (
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%"
              innerRadius={isDonut ? '55%' : 0} outerRadius="80%"
              paddingAngle={2} strokeWidth={0}
              activeIndex={activeIndex}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(undefined)}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#475569', strokeWidth: 1 }}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={getColor(i)} opacity={activeIndex !== undefined && activeIndex !== i ? 0.4 : 1}
                  style={{ transition: 'opacity 0.2s', cursor: 'pointer' }} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        );
      }

      case 'SCATTER':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="x" name="X" {...axisProps} type="number" />
            <YAxis dataKey="y" name="Y" {...axisProps} type="number" />
            <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
            <Scatter data={chartData} fill={color}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={getColor(i % seriesColors.length)} />
              ))}
            </Scatter>
          </ScatterChart>
        );

      case 'RADAR':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: '#52525b', fontSize: 9 }} />
            {seriesKeys.map((key, i) => (
              <Radar key={key} dataKey={key} stroke={getColor(i)} fill={getColor(i)} fillOpacity={hiddenSeries.has(key) ? 0 : 0.15} strokeWidth={2}
                hide={hiddenSeries.has(key)} />
            ))}
            {legendProps && <Legend {...legendProps} />}
            <Tooltip {...tooltipStyle} />
          </RadarChart>
        );

      case 'RADIAL':
        return (
          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={chartData} startAngle={180} endAngle={0}>
            <RadialBar dataKey="value" background={{ fill: '#1e1e2e' }} cornerRadius={4}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={getColor(i)} />
              ))}
            </RadialBar>
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          </RadialBarChart>
        );

      case 'TREEMAP':
        return (
          <Treemap data={chartData} dataKey="value" nameKey="name"
            stroke="#09090b"
            content={({ x, y, width, height, name, index }: { x: number; y: number; width: number; height: number; name: string; index: number }) => (
              <g>
                <rect x={x} y={y} width={width} height={height} fill={getColor(index)} rx={4} opacity={0.85} />
                {width > 40 && height > 20 && (
                  <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle"
                    fill="#f8fafc" fontSize={Math.min(12, width / 6)}>
                    {name}
                  </text>
                )}
              </g>
            )}
          />
        );

      case 'COMPOSED':
      case 'MIXED':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" {...axisProps} dy={10} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            {legendProps && <Legend {...legendProps} />}
            {seriesKeys.map((key, i) => {
              if (hiddenSeries.has(key)) return null;
              if (i === 0) return <Bar key={key} dataKey={key} fill={getColor(i)} radius={[4, 4, 0, 0]} opacity={0.8} />;
              return <Line key={key} type="monotone" dataKey={key} stroke={getColor(i)} strokeWidth={2} dot={false} />;
            })}
            {showBrush && <Brush dataKey="name" height={20} stroke="#6366f1" fill="#09090b" travellerWidth={8} />}
          </ComposedChart>
        );

      // Default: BAR
      default:
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" {...axisProps} dy={10} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} cursor={{ fill: '#27272a', opacity: 0.4 }} />
            {legendProps && <Legend {...legendProps} />}
            {seriesKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={getColor(i)} radius={[4, 4, 0, 0]} hide={hiddenSeries.has(key)} />
            ))}
            {showBrush && <Brush dataKey="name" height={20} stroke="#6366f1" fill="#09090b" travellerWidth={8} />}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-72 flex flex-col bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        {title && <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h4>}
        <button onClick={handleExportCsv} className="p-1 rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-colors" title="Export CSV">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
