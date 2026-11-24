import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showWordmark?: boolean
  compact?: boolean
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] bg-primary shadow-[0_8px_20px_-10px_rgba(13,124,134,0.7)]',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="size-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 16.5c1.8 6 5.3 9.2 10 9.2s8.2-3.2 10-9.2"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="28.8" cy="12.4" r="2.2" fill="#CFF7FA" />
        <circle cx="11.2" cy="12.4" r="1.2" fill="#CFF7FA" opacity="0.55" />
      </svg>
    </span>
  )
}

export function Logo({
  className,
  showWordmark = true,
  compact = false,
}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={compact ? 'size-8' : undefined} />
      {showWordmark ? (
        <span className="leading-none">
          <span className="block font-display text-[1.65rem] tracking-[-0.03em] text-ink">
            clareia
          </span>
          {!compact ? (
            <span className="mt-0.5 block font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
              odontologia
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  )
}
