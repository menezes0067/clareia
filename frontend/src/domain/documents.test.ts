import { describe, expect, it } from 'vitest'
import { isValidCnpj } from '@/domain/documents'

describe('validação de CNPJ', () => {
  it('aceita CNPJ formatado com dígitos verificadores válidos', () => {
    expect(isValidCnpj('12.345.678/0001-95')).toBe(true)
    expect(isValidCnpj('12345678000195')).toBe(true)
  })

  it('rejeita dígitos verificadores inválidos', () => {
    expect(isValidCnpj('12.345.678/0001-00')).toBe(false)
  })

  it('rejeita tamanho incorreto e sequências repetidas', () => {
    expect(isValidCnpj('123456')).toBe(false)
    expect(isValidCnpj('00.000.000/0000-00')).toBe(false)
  })
})
