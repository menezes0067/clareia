import { cn } from '@/lib/utils'

const palettes = {
  teal: {
    icon: 'bg-[#E4F6F5] text-[#0B565E]',
    spark: 'text-[#0D7C86]',
  },
  mint: {
    icon: 'bg-[#E8F7EF] text-[#27634D]',
    spark: 'text-[#66B894]',
  },
  sand: {
    icon: 'bg-[#FDF1E4] text-[#7A5327]',
    spark: 'text-[#DDA05F]',
  },
  rose: {
    icon: 'bg-[#FBE9EC] text-[#7D3441]',
    spark: 'text-[#D98594]',
  },
} as const

interface SparklineProps {
  data: number[]
  className?: string
  label?: string
}

export function Sparkline({ data, className, label }: SparklineProps) {
  const width = 120
  const height = 36
  const padding = 2
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0

  const points = data.map((value, index) => {
    const x = padding + index * step
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return [x, y] as const
  })

  const line = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const area = `${line} L${width - padding} ${height} L${padding} ${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-9 w-full', className)}
      role="img"
      aria-label={label ?? 'Tendência dos últimos dias'}
    >
      <path d={area} fill="currentColor" opacity="0.09" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 ? (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="2.2"
          fill="currentColor"
        />
      ) : null}
    </svg>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tone?: keyof typeof palettes
  spark?: number[]
  trendLabel?: string
  className?: string
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'teal',
  spark,
  trendLabel,
  className,
}: StatCardProps) {
  const palette = palettes[tone]
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(13,124,134,0.03)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-[1.55rem] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[1.75rem]">
            {value}
          </p>
          {hint ? (
            <p className="mt-1.5 text-[0.72rem] leading-snug text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl',
            palette.icon,
          )}
        >
          <Icon className="size-4" strokeWidth={1.8} />
        </span>
      </div>
      <div className={cn('mt-3 -mb-1 min-h-7', palette.spark)}>
        {spark ? (
          <Sparkline data={spark} className="h-7" label={trendLabel} />
        ) : null}
      </div>
    </div>
  )
}
