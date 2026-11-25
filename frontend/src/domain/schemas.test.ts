import { describe, expect, it } from 'vitest'
import {
  appointmentFormSchema,
  clinicFormSchema,
  dentistFormSchema,
  loginSchema,
  onboardingSchema,
  patientFormSchema,
} from '@/domain/schemas'

describe('validação de formulários', () => {
  it('valida login com e-mail e senha', () => {
    expect(
      loginSchema.safeParse({ email: 'marina@clareia.app', password: 'senha123' })
        .success,
    ).toBe(true)
    expect(loginSchema.safeParse({ email: 'invalido', password: '' }).success).toBe(
      false,
    )
  })

  it('exige dentista responsável no cadastro de paciente', () => {
    const base = {
      name: 'Ana Beatriz Souza',
      email: 'ana@email.com',
      phone: '(11) 99999-0000',
      birthDate: '1990-04-12',
      notes: '',
    }
    expect(patientFormSchema.safeParse({ ...base, dentistId: '' }).success).toBe(
      false,
    )
    expect(
      patientFormSchema.safeParse({ ...base, dentistId: 'dent-rafael' }).success,
    ).toBe(true)
  })

  it('rejeita datas de nascimento futuras', () => {
    const result = patientFormSchema.safeParse({
      name: 'Ana Beatriz Souza',
      email: 'ana@email.com',
      phone: '(11) 99999-0000',
      birthDate: '2999-01-01',
      dentistId: 'dent-rafael',
      notes: '',
    })
    expect(result.success).toBe(false)
  })

  it('exige CRO e especialidade para dentistas', () => {
    const base = {
      name: 'Dra. Helena Barros',
      email: 'helena@clareia.app',
      phone: '(11) 99999-0000',
      bio: '',
    }
    expect(dentistFormSchema.safeParse({ ...base, cro: '', specialty: '' }).success).toBe(
      false,
    )
    expect(
      dentistFormSchema.safeParse({
        ...base,
        cro: 'CRO-SP 12.345',
        specialty: 'Endodontia',
      }).success,
    ).toBe(true)
  })

  it('converte duração da consulta para número', () => {
    const parsed = appointmentFormSchema.parse({
      patientId: 'patient-01',
      dentistId: 'dent-rafael',
      date: '2026-11-23',
      startTime: '09:00',
      durationMinutes: '60',
      type: 'return',
      notes: '',
    })
    expect(parsed.durationMinutes).toBe(60)
  })

  it('valida o cadastro em etapas da dona e da clínica', () => {
    const owner = {
      name: 'Dra. Helena Barros',
      email: 'helena@clareia.app',
      phone: '(11) 99999-1234',
      cro: 'CRO-SP 12.345',
      specialty: 'Endodontia',
      password: 'senhaSegura123',
    }
    const clinic = {
      name: 'Clínica Helena',
      address: 'Rua Nova, 42 — São Paulo',
      cnpj: '12.345.678/0001-95',
      phone: '(11) 3333-4444',
      email: 'contato@clinicahelena.com',
    }

    expect(onboardingSchema.safeParse({ owner, clinic }).success).toBe(true)
    expect(
      onboardingSchema.safeParse({ owner: { ...owner, password: '123' }, clinic })
        .success,
    ).toBe(false)
    expect(
      onboardingSchema.safeParse({ owner: { ...owner, cro: '' }, clinic })
        .success,
    ).toBe(false)
    expect(
      onboardingSchema.safeParse({ owner, clinic: { ...clinic, name: '' } })
        .success,
    ).toBe(false)
  })

  it('valida os dados básicos da clínica', () => {
    expect(
      clinicFormSchema.safeParse({
        name: 'Clareia Odontologia',
        address: 'Rua das Acácias, 128',
        cnpj: '12.345.678/0001-95',
        phone: '(11) 3082-4410',
        email: 'ola@clareia.app',
      }).success,
    ).toBe(true)
  })

  it('exige CNPJ com dígitos verificadores válidos', () => {
    const base = {
      name: 'Clareia Odontologia',
      address: 'Rua das Acácias, 128',
      phone: '(11) 3082-4410',
      email: 'ola@clareia.app',
    }
    expect(
      clinicFormSchema.safeParse({ ...base, cnpj: '12.345.678/0001-00' })
        .success,
    ).toBe(false)
    expect(
      clinicFormSchema.safeParse({ ...base, cnpj: '12345678000195' }).success,
    ).toBe(true)
  })

  it('formata telefone e e-mail ao validar', () => {
    const parsed = patientFormSchema.parse({
      name: 'Ana Beatriz Souza',
      email: '  ANA@EMAIL.COM ',
      phone: '11999990000',
      birthDate: '1990-04-12',
      dentistId: 'dent-rafael',
      notes: '',
    })
    expect(parsed.phone).toBe('(11) 99999-0000')
    expect(parsed.email).toBe('ana@email.com')
  })
})
