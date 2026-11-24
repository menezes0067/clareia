import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
  optional?: boolean
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  optional,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {/* Envolver o controle no label garante associação mesmo quando ele vem
          de um Controller/Select, sem exigir ids em todos os formulários. */}
      <Label
        htmlFor={htmlFor}
        className="block space-y-1.5 text-[0.78rem] font-medium text-foreground"
      >
        <span className="flex items-center justify-between gap-3">
          <span>{label}</span>
          {optional ? (
            <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              opcional
            </span>
          ) : null}
        </span>
        {children}
      </Label>
      {error ? (
        <p className="text-[0.72rem] font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-0.5">
        <h3 className="text-[0.8rem] font-semibold text-ink">{title}</h3>
        {description ? (
          <p className="text-[0.7rem] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
