import { useEffect, useMemo, useState } from "react";
import type { FinanceCategory, TrendPoint } from "../types";
import { getFlattenedTrendOptions, getTrendSeriesFromData } from "../utils/financeCalculations";
import { formatCompactMonthLabel, formatMonthLabel } from "../utils/dateUtils";
import { formatCurrency } from "../utils/formatters";

const compactCurrencyFormatter = new Intl.NumberFormat(undefined, {
  currency: "USD",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency",
});

type TrendsCardProps = {
  categories: FinanceCategory[];
  onMonthChange: (monthKey: string) => void;
  selectedTargetId: string;
};

export function TrendsCard({
  categories,
  onMonthChange,
  selectedTargetId,
}: TrendsCardProps) {
  const options = useMemo(() => getFlattenedTrendOptions(categories), [categories]);
  const selectedOption = options.find((option) => option.id === selectedTargetId) ?? options[0];
  const targetId = selectedOption?.id ?? selectedTargetId;
  const series = useMemo(() => getTrendSeriesFromData(categories, targetId), [categories, targetId]);

  return (
    <section className="dashboard-card trends-card" aria-label="Trends">
      <div className="trends-layout">
        <div className="chart-panel">
          <div className="chart-summary">
            <div>
              <strong>{selectedOption?.label ?? "Trend target"}</strong>
            </div>
          </div>

          <GoldLineChart points={series} onPointClick={onMonthChange} />
        </div>
      </div>
    </section>
  );
}

function GoldLineChart({
  points,
  onPointClick,
}: {
  points: TrendPoint[];
  onPointClick: (monthKey: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(points.length - 1);
  const [hoveredIndex, setHoveredIndex] = useState<number>();
  const width = 640;
  const height = 280;
  const padding = { top: 24, right: 22, bottom: 54, left: 76 };
  const numericPoints = points.filter((point): point is TrendPoint & { value: number } => point.value !== null);
  const values = numericPoints.map((point) => point.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const valueRange = maxValue - minValue || 1;

  useEffect(() => {
    setActiveIndex(numericPoints.length - 1);
  }, [numericPoints.length]);

  if (numericPoints.length === 0) {
    return (
      <div className="gold-line-chart">
        <div className="chart-empty-state">No datapoints saved yet</div>
      </div>
    );
  }

  const plottedPoints = numericPoints.map((point, index) => {
    const x =
      padding.left +
      (index / Math.max(numericPoints.length - 1, 1)) * (width - padding.left - padding.right);
    const y =
      padding.top +
      (1 - (point.value - minValue) / valueRange) * (height - padding.top - padding.bottom);
    return { ...point, x, y };
  });

  const linePath = getSmoothPath(plottedPoints);
  const lastPoint = plottedPoints[plottedPoints.length - 1];
  const areaPath = `${linePath} L ${lastPoint?.x ?? padding.left} ${height - padding.bottom} L ${
    plottedPoints[0]?.x ?? padding.left
  } ${height - padding.bottom} Z`;
  const safeActiveIndex =
    activeIndex >= 0 && activeIndex < plottedPoints.length ? activeIndex : plottedPoints.length - 1;
  const tooltipPoint =
    hoveredIndex !== undefined && hoveredIndex >= 0 && hoveredIndex < plottedPoints.length
      ? plottedPoints[hoveredIndex]
      : undefined;
  const yTicks = [0, 1, 2, 3, 4].map((tick) => {
    const ratio = tick / 4;
    return {
      value: maxValue - valueRange * ratio,
      y: padding.top + ratio * (height - padding.top - padding.bottom),
    };
  });

  return (
    <div className="gold-line-chart" onMouseLeave={() => setHoveredIndex(undefined)}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly trend line chart">
        <defs>
          <linearGradient id="gold-chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffd84d" stopOpacity="0.32" />
            <stop offset="48%" stopColor="#ffb020" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffcf6a" stopOpacity="0.01" />
          </linearGradient>
          <filter id="gold-line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <text
          className="chart-y-axis-title"
          textAnchor="middle"
          transform={`translate(15 ${padding.top + (height - padding.top - padding.bottom) / 2}) rotate(-90)`}
        >
          Amount
        </text>

        <line
          className="chart-axis-line"
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
        />
        <text
          className="chart-x-axis-title"
          x={padding.left + (width - padding.left - padding.right) / 2}
          y={height - 6}
          textAnchor="middle"
        >
          Month
        </text>
        <line
          className="chart-axis-line"
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
        />

        {yTicks.map((tick) => (
          <g key={`${tick.y}-${tick.value}`}>
            <line
              className="chart-grid-line"
              x1={padding.left}
              x2={width - padding.right}
              y1={tick.y}
              y2={tick.y}
            />
            <line
              className="chart-y-tick"
              x1={padding.left - 5}
              x2={padding.left}
              y1={tick.y}
              y2={tick.y}
            />
            <text className="chart-y-label" x={padding.left - 9} y={tick.y + 4} textAnchor="end">
              {formatCompactCurrency(tick.value)}
            </text>
          </g>
        ))}

        <path className="chart-area" d={areaPath} />
        <path className="chart-line chart-line-glow" d={linePath} filter="url(#gold-line-glow)" />
        <path className="chart-line" d={linePath} />

        {plottedPoints.map((point, index) => (
          <g key={point.monthKey}>
            <circle
              className={index === safeActiveIndex ? "chart-hit-dot is-active" : "chart-hit-dot"}
              cx={point.x}
              cy={point.y}
              r="22"
              onMouseEnter={() => {
                setActiveIndex(index);
                setHoveredIndex(index);
              }}
              onFocus={() => {
                setActiveIndex(index);
                setHoveredIndex(index);
              }}
              onBlur={() => setHoveredIndex(undefined)}
              onClick={() => onPointClick(point.monthKey)}
              tabIndex={0}
              aria-label={`${formatMonthLabel(point.monthKey)} ${formatCurrency(point.value)}`}
            />
            <circle className={index === safeActiveIndex ? "chart-dot is-active" : "chart-dot"} cx={point.x} cy={point.y} r="7" />
            <text className="chart-axis-label" x={point.x} y={height - 25} textAnchor="middle">
              {formatCompactMonthLabel(point.monthKey).replace(" ", "\n")}
            </text>
          </g>
        ))}

        {tooltipPoint && (
          <g
            className="chart-tooltip-svg"
            transform={`translate(${clamp(tooltipPoint.x - 77, 8, width - 162)} ${Math.min(tooltipPoint.y + 18, height - 56)})`}
          >
            <rect
              width="154"
              height="48"
              rx="8"
              fill="rgba(17, 15, 9, 0.96)"
              stroke="#ffdc78"
            />
            <text x="12" y="19" fill="#fff3c4" fontSize="12" fontWeight="850">
              {formatMonthLabel(tooltipPoint.monthKey)}
            </text>
            <text x="12" y="36" fill="#ffd84d" fontSize="12" fontWeight="950">
              {formatCurrency(tooltipPoint.value)}
            </text>
          </g>
        )}

      </svg>
    </div>
  );
}

function getSmoothPath(points: Array<TrendPoint & { value: number; x: number; y: number }>): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlX = previous.x + (point.x - previous.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}
