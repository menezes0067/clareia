import { z } from 'zod'
import { isValidCnpj } from '@/domain/documents'
import { isValidISODate, todayISO } from '@/lib/dates'
import { formatCnpj, formatCro, formatPhone } from '@/lib/format'

const nameField = z
  .string()
  .trim()
  .min(3, 'Informe o nome completo.')
  .max(80, 'Nome muito longo.')
  .transform((value) => value.replace(/\s+/g, ' '))

const emailField = z
  .string()
  .trim()
  .pipe(z.email('Informe um e-mail válido.'))
  .transform((value) => value.toLowerCase())

const phoneField = z
  .string()
  .trim()
  .refine((value) => {
    const digits = value.replace(/\D/g, '')
    return (
      (digits.length === 10 || digits.length === 11) && /^[1-9]\d/.test(digits)
    )
  }, 'Informe um telefone válido com DDD.')
  .transform(formatPhone)

const croField = z
  .string()
  .trim()
  .min(4, 'Informe o CRO.')
  .max(24, 'CRO muito longo.')
  .transform(formatCro)
  .refine(
    (value) => /[A-Z]{2}/.test(value) && value.replace(/\D/g, '').length >= 4,
    'Use o formato CRO-UF 12.345.',
  )

const cnpjField = z
  .string()
  .trim()
  .refine(isValidCnpj, 'Informe um CNPJ válido.')
  .transform(formatCnpj)

const isoDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.')
  .refine(isValidISODate, 'Data inválida.')

export const patientFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  birthDate: isoDateField.refine(
    (value) => value <= todayISO(),
    'A data não pode estar no futuro.',
  ),
  dentistId: z.string().min(1, 'Escolha o dentista responsável.'),
  notes: z.string().max(1200, 'Use até 1200 caracteres.').optional().default(''),
})

export type PatientFormValues = z.infer<typeof patientFormSchema>

export const dentistFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  cro: croField,
  specialty: z.string().trim().min(2, 'Informe a especialidade.'),
  bio: z.string().max(400, 'Use até 400 caracteres.').optional().default(''),
  password: z
    .string()
    .optional()
    .default('')
    .refine(
      (value) => value.length === 0 || value.length >= 6,
      'A senha deve ter pelo menos 6 caracteres.',
    ),
})

export type DentistFormValues = z.infer<typeof dentistFormSchema>

/** Etapa 1 do cadastro: os dados da dona antes de existir uma clínica. */
export const ownerFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  cro: croField,
  specialty: z.string().trim().min(2, 'Informe a especialidade.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
})

export type OwnerFormValues = z.infer<typeof ownerFormSchema>

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Escolha o paciente.'),
  dentistId: z.string().min(1, 'Escolha o dentista.'),
  date: isoDateField,
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Escolha um horário.'),
  durationMinutes: z.coerce
    .number()
    .int('Use minutos inteiros.')
    .min(15, 'Duração mínima de 15 min.')
    .max(240, 'Duração máxima de 4 h.'),
  type: z.enum([
    'evaluation',
    'cleaning',
    'return',
    'root_canal',
    'orthodontics',
    'implant',
    'whitening',
    'urgency',
  ]),
  notes: z.string().max(800, 'Use até 800 caracteres.').optional().default(''),
})

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

export const clinicFormSchema = z.object({
  name: z.string().trim().min(3, 'Informe o nome da clínica.'),
  address: z.string().trim().min(5, 'Informe o endereço.'),
  cnpj: cnpjField,
  phone: phoneField,
  email: emailField,
})

export type ClinicFormValues = z.infer<typeof clinicFormSchema>

/** Cadastro em duas etapas: dona → clínica. */
export const onboardingSchema = z.object({
  owner: ownerFormSchema,
  clinic: clinicFormSchema,
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Informe a senha.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
