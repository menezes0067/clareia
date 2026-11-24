import type {
  AppointmentStatus,
  DentistRole,
  DentistStatus,
  PatientStatus,
} from '@/domain/types'
import {
  appointmentStatusLabels,
  dentistRoleLabels,
  dentistStatusLabels,
  patientStatusLabels,
} from '@/domain/labels'
import { cn } from '@/lib/utils'

const appointmentStyles: Record<AppointmentStatus, string> = {
  scheduled: 'border-border bg-card text-foreground',
  confirmed: 'border-[#C9EBD9] bg-[#E8F7EF] text-[#27634D]',
  completed: 'border-[#DCEBE9] bg-[#EDF5F5] text-[#4F6C6D]',
  cancelled: 'border-[#F3CFD4] bg-[#FBE9EC] text-[#7D3441]',
  no_show: 'border-[#F4D9BC] bg-[#FDF1E4] text-[#7A5327]',
}

export const statusDotStyles: Record<AppointmentStatus, string> = {
  scheduled: 'bg-primary',
  confirmed: 'bg-[#66B894]',
  completed: 'bg-[#8FA9A8]',
  cancelled: 'bg-[#D98594]',
  no_show: 'bg-[#DDA05F]',
}

export function AppointmentStatusBadge({
  status,
  className,
  showDot = true,
}: {
  status: AppointmentStatus
  className?: string
  showDot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium',
        appointmentStyles[status],
        className,
      )}
    >
      {showDot ? (
        <span
          className={cn('size-1.5 rounded-full', statusDotStyles[status])}
        />
      ) : null}
      {appointmentStatusLabels[status]}
    </span>
  )
}

export function DentistStatusBadge({ status }: { status: DentistStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium',
        status === 'active'
          ? 'border-[#C9EBD9] bg-[#E8F7EF] text-[#27634D]'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          status === 'active' ? 'bg-[#66B894]' : 'bg-[#9DB3B2]',
        )}
      />
      {dentistStatusLabels[status]}
    </span>
  )
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium',
        status === 'active'
          ? 'border-[#C9EBD9] bg-[#E8F7EF] text-[#27634D]'
          : 'border-[#F4D9BC] bg-[#FDF1E4] text-[#7A5327]',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          status === 'active' ? 'bg-[#66B894]' : 'bg-[#DDA05F]',
        )}
      />
      {patientStatusLabels[status]}
    </span>
  )
}

export function RoleBadge({ role }: { role: DentistRole }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.72rem] font-medium',
        role === 'owner'
          ? 'border-[#C3E9E7] bg-[#E4F6F5] text-[#0B565E]'
          : 'border-border bg-card text-muted-foreground',
      )}
    >
      {role === 'owner' ? <CrownDot /> : null}
      {dentistRoleLabels[role]}
    </span>
  )
}

function CrownDot() {
  return (
    <span className="inline-block size-1.5 rounded-full bg-[#0D7C86]" />
  )
}
