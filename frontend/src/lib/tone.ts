import type { DentistTone } from '@/domain/types'

export interface ToneStyle {
  bg: string
  text: string
  dot: string
  border: string
  soft: string
  solid: string
}

export const dentistTones: Record<DentistTone, ToneStyle> = {
  teal: {
    bg: 'bg-[#E4F6F5]',
    text: 'text-[#0B565E]',
    dot: 'bg-[#0D7C86]',
    border: 'border-[#C3E9E7]',
    soft: 'bg-[#F1FAF9]',
    solid: 'bg-[#0D7C86]',
  },
  sky: {
    bg: 'bg-[#E2F5F9]',
    text: 'text-[#0E5D6B]',
    dot: 'bg-[#3DAFC0]',
    border: 'border-[#C5EDF4]',
    soft: 'bg-[#F2FAFC]',
    solid: 'bg-[#3DAFC0]',
  },
  mint: {
    bg: 'bg-[#E8F7EF]',
    text: 'text-[#27634D]',
    dot: 'bg-[#66B894]',
    border: 'border-[#C9EBD9]',
    soft: 'bg-[#F3FAF6]',
    solid: 'bg-[#66B894]',
  },
  sand: {
    bg: 'bg-[#FDF1E4]',
    text: 'text-[#7A5327]',
    dot: 'bg-[#DDA05F]',
    border: 'border-[#F4D9BC]',
    soft: 'bg-[#FEF8F2]',
    solid: 'bg-[#DDA05F]',
  },
  rose: {
    bg: 'bg-[#FBE9EC]',
    text: 'text-[#7D3441]',
    dot: 'bg-[#D98594]',
    border: 'border-[#F3CFD4]',
    soft: 'bg-[#FDF5F6]',
    solid: 'bg-[#D98594]',
  },
}

const fallbackOrder: DentistTone[] = ['teal', 'sky', 'mint', 'sand', 'rose']

export function toneFromName(name: string): ToneStyle {
  const total = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return dentistTones[fallbackOrder[total % fallbackOrder.length]]
}

export function toneForDentist(tone?: DentistTone): ToneStyle {
  return dentistTones[tone ?? 'teal']
}
