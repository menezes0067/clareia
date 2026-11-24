/** Valida CNPJ incluindo os dois dígitos verificadores. */

function checkDigit(base: number[], weights: number[]): number {
  const sum = weights.reduce((total, weight, index) => total + base[index] * weight, 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false

  const numbers = digits.split('').map(Number)
  const first = checkDigit(numbers.slice(0, 12), [
    5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ])
  if (first !== numbers[12]) return false

  const second = checkDigit(numbers.slice(0, 13), [
    6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ])
  return second === numbers[13]
}
