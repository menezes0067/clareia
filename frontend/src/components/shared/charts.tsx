import { useId } from 'react'
import { cn } from '@/lib/utils'

interface WeeklyBarsProps {
  data: { label: string; value: number; highlight?: boolean }[]
  className?: string
  unit?: string
}

export function WeeklyBars({ data, className, unit = 'consultas' }: WeeklyBarsProps) {
  const max = Math.max(...data.map((item) => item.value), 1)
  return (
    <div
      role="list"
      aria-label={`Consultas por dia — ${unit}`}
      className={cn('flex h-40 items-end gap-2.5 sm:gap-3', className)}
    >
      {data.map((item) => {
        const height = Math.max((item.value / max) * 100, item.value > 0 ? 8 : 2)
        return (
          <div
            key={item.label}
            role="listitem"
            aria-label={`${item.label}: ${item.value} ${unit}`}
            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="font-mono text-[0.68rem] font-medium text-muted-foreground">
              {item.value}
            </span>
            <div
              aria-hidden="true"
              className="relative min-h-0 w-full max-w-9 flex-1 overflow-hidden rounded-full bg-secondary"
              title={`${item.value} ${unit}`}
            >
              <div
                className={cn(
                  'absolute inset-x-0 bottom-0 rounded-full transition-all duration-500',
                  item.highlight
                    ? 'bg-primary'
                    : 'bg-[linear-gradient(180deg,#9ADFD8_0%,#67C9C9_100%)]',
                )}
                style={{ height: `${height}%` }}
              >
                {item.highlight ? (
                  <span className="absolute inset-x-0 top-0 h-1/3 rounded-full bg-card/20" />
                ) : null}
              </div>
            </div>
            <span
              className={cn(
                'font-mono text-[0.7rem] uppercase tracking-wide',
                item.highlight
                  ? 'font-semibold text-primary'
                  : 'text-muted-foreground',
              )}
            >
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface OccupancyRingProps {
  value: number
  size?: number
  stroke?: number
  label?: string
  className?: string
}

export function OccupancyRing({
  value,
  size = 136,
  stroke = 10,
  label = 'ocupação',
  className,
}: OccupancyRingProps) {
  const gradientId = `ring-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const clamped = Math.min(Math.max(value, 0), 100)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const valueFontSize = Math.min(26, Math.max(15, size * 0.26))
  const labelFontSize = Math.min(11, Math.max(8, size * 0.11))

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped}% de ${label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0D7C86" />
            <stop offset="100%" stopColor="#67C9C9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-1 text-center">
        <span
          className="whitespace-nowrap font-semibold leading-none tracking-[-0.04em] text-ink"
          style={{ fontSize: valueFontSize }}
        >
          {clamped}%
        </span>
        <span
          className="mt-1 whitespace-nowrap font-mono uppercase leading-none tracking-[0.08em] text-muted-foreground"
          style={{ fontSize: labelFontSize }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
