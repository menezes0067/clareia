import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'
import { toneFromName, toneForDentist, type ToneStyle } from '@/lib/tone'
import type { DentistTone } from '@/domain/types'

const sizeStyles = {
  xs: 'size-7 text-[0.7rem]',
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-20 text-xl',
}

interface InitialsAvatarProps {
  name: string
  tone?: DentistTone
  size?: keyof typeof sizeStyles
  className?: string
  ring?: boolean
}

export function InitialsAvatar({
  name,
  tone,
  size = 'md',
  className,
  ring = false,
}: InitialsAvatarProps) {
  const palette = tone ? toneForDentist(tone) : toneFromName(name)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide',
        palette.bg,
        palette.text,
        sizeStyles[size],
        ring && 'ring-2 ring-card',
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

interface IconTileProps {
  icon: LucideIcon
  tone?: ToneStyle
  className?: string
}

export function IconTile({ icon: Icon, tone, className }: IconTileProps) {
  return (
    <span
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-xl',
        tone?.bg ?? 'bg-secondary',
        tone?.text ?? 'text-primary',
        className,
      )}
    >
      <Icon className="size-[1.1rem]" strokeWidth={1.8} />
    </span>
  )
}
