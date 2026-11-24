import { useClinic } from '@/data/clinic-provider'
import type { DentistTone } from '@/domain/types'
import { InitialsAvatar } from './avatar'

interface AvatarStackProps {
  size?: 'xs' | 'sm'
  people?: { name: string; tone: DentistTone }[]
}

export function AvatarStack({ size = 'xs', people }: AvatarStackProps) {
  const { dentists } = useClinic()
  const members =
    people ??
    dentists
      .filter((dentist) => dentist.status === 'active')
      .slice(0, 3)
      .map((dentist) => ({ name: dentist.name, tone: dentist.tone }))

  if (members.length === 0) return null

  return (
    <div className="flex -space-x-2">
      {members.map((person) => (
        <InitialsAvatar
          key={person.name}
          name={person.name}
          tone={person.tone}
          size={size}
          className="ring-2 ring-card"
        />
      ))}
    </div>
  )
}
