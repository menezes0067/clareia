import type { ChangeEvent } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

/**
 * Aplica uma máscara enquanto o usuário digita, mantendo o registro do RHF.
 * O valor gravado no formulário já sai formatado.
 */
export function masked(
  registration: UseFormRegisterReturn,
  format: (value: string) => string,
): UseFormRegisterReturn {
  return {
    ...registration,
    onChange: ((event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = format(event.target.value)
      return registration.onChange(event)
    }) as UseFormRegisterReturn['onChange'],
  }
}
