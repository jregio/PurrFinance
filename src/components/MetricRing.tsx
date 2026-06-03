import { useState } from "react";
import { formatCurrency } from "../utils/formatters";

export type RingSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
  details?: string[];
};

type MetricRingProps = {
  segments: RingSegment[];
  centerLabel: string;
  centerImage?: string;
  activeSegmentId?: string;
  size?: "normal" | "compact";
  showCenterText?: boolean;
  showLegend?: boolean;
  showSegmentTitles?: boolean;
  onSegmentHover?: (segmentId: string | undefined) => void;
  onSegmentClick?: (segmentId: string) => void;
};

const radius = 52;
const circumference = 2 * Math.PI * radius;

export function MetricRing({
  segments,
  centerLabel,
  centerImage,
  activeSegmentId,
  size = "normal",
  showCenterText = true,
  showLegend = true,
  showSegmentTitles = true,
  onSegmentHover,
  onSegmentClick,
}: MetricRingProps) {
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string>();
  const visibleSegments = segments.filter((segment) => segment.value > 0);
  const total = visibleSegments.reduce((sum, segment) => sum + segment.value, 0);
  const highlightedSegmentId = hoveredSegmentId ?? activeSegmentId;
  let offset = 0;

  return (
    <div
      className={size === "compact" ? "metric-ring-wrap is-compact" : "metric-ring-wrap"}
      onMouseLeave={() => {
        setHoveredSegmentId(undefined);
        onSegmentHover?.(undefined);
      }}
    >
      <svg className="metric-ring" viewBox="0 0 140 140" role="img" aria-label="Monthly money flow ring">
        <circle className="ring-track" cx="70" cy="70" r={radius} />
        {total > 0 &&
          visibleSegments.map((segment) => {
            const dashLength = (segment.value / total) * circumference;
            const dashOffset = -offset;
            offset += dashLength;

            return (
              <circle
                key={segment.id}
                className={
                  highlightedSegmentId === segment.id
                    ? "ring-segment is-active"
                    : "ring-segment"
                }
                cx="70"
                cy="70"
                r={radius}
                stroke={segment.color}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                tabIndex={0}
                aria-label={`${segment.label} ${formatCurrency(segment.value)}`}
                onMouseEnter={() => {
                  setHoveredSegmentId(segment.id);
                  onSegmentHover?.(segment.id);
                }}
                onFocus={() => {
                  setHoveredSegmentId(segment.id);
                  onSegmentHover?.(segment.id);
                }}
                onBlur={() => {
                  setHoveredSegmentId(undefined);
                  onSegmentHover?.(undefined);
                }}
                onClick={() => onSegmentClick?.(segment.id)}
              >
                {showSegmentTitles && (
                  <title>
                    {[segment.label, formatCurrency(segment.value), ...(segment.details ?? [])].join("\n")}
                  </title>
                )}
              </circle>
            );
          })}
        {centerImage ? (
          <image
            className="ring-center-image"
            href={centerImage}
            x="49"
            y="49"
            width="42"
            height="42"
            preserveAspectRatio="xMidYMid meet"
          />
        ) : showCenterText ? (
          <>
            <text className="ring-center-label" x="70" y="64" textAnchor="middle">
              {centerLabel}
            </text>
            <text className="ring-center-value" x="70" y="82" textAnchor="middle">
              {formatCurrency(total)}
            </text>
          </>
        ) : (
          <circle className="ring-center-mark" cx="70" cy="70" r="10" />
        )}
      </svg>
      {showLegend && (
        <div className="ring-legend" aria-label="Ring legend">
          {segments.map((segment) => (
            <div
              className={
                highlightedSegmentId === segment.id
                  ? "ring-legend-item is-active"
                  : "ring-legend-item"
              }
              key={segment.id}
              title={[segment.label, formatCurrency(segment.value), ...(segment.details ?? [])].join("\n")}
              onClick={() => onSegmentClick?.(segment.id)}
              onMouseEnter={() => {
                setHoveredSegmentId(segment.id);
                onSegmentHover?.(segment.id);
              }}
            >
              <span className="legend-dot" style={{ background: segment.color }} />
              <span>{segment.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
