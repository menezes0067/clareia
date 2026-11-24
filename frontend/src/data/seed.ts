import { addDaysISO, todayISO } from '@/lib/dates'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  Clinic,
  ClinicState,
  Dentist,
  Patient,
} from '@/domain/types'
import { findDentistConflict, findPatientConflict } from '@/domain/appointments'
import { appointmentDurationByType } from '@/domain/labels'
import { CLINIC_STATE_VERSION } from '@/domain/clinic'

export const DB_VERSION = CLINIC_STATE_VERSION

const CLINIC: Clinic = {
  id: 'clinic-clareia',
  name: 'Clareia Odontologia',
  address: 'Rua das Acácias, 128 — Vila Madalena, São Paulo',
  cnpj: '12.345.678/0001-95',
  phone: '(11) 3082-4410',
  email: 'ola@clareia.app',
  ownerDentistId: 'dent-marina',
  createdAt: '2023-02-10T12:00:00.000Z',
}

const DENTISTS: Dentist[] = [
  {
    id: 'dent-marina',
    clinicId: CLINIC.id,
    name: 'Dra. Marina Prado',
    email: 'marina@clareia.app',
    phone: '(11) 99812-4401',
    cro: 'CRO-SP 48.210',
    specialty: 'Clínica geral & estética',
    role: 'owner',
    status: 'active',
    tone: 'teal',
    bio: 'Fundadora da Clareia. Acredita em odontologia sem pressa, com tempo para escutar.',
    createdAt: '2023-02-10T12:00:00.000Z',
  },
  {
    id: 'dent-rafael',
    clinicId: CLINIC.id,
    name: 'Dr. Rafael Nunes',
    email: 'rafael@clareia.app',
    phone: '(11) 99775-1290',
    cro: 'CRO-SP 51.932',
    specialty: 'Ortodontia',
    role: 'dentist',
    status: 'active',
    tone: 'sky',
    bio: 'Especialista em alinhadores e ortodontia preventiva.',
    createdAt: '2023-06-18T12:00:00.000Z',
  },
  {
    id: 'dent-camila',
    clinicId: CLINIC.id,
    name: 'Dra. Camila Reis',
    email: 'camila@clareia.app',
    phone: '(11) 99640-7733',
    cro: 'CRO-SP 55.401',
    specialty: 'Endodontia',
    role: 'dentist',
    status: 'active',
    tone: 'mint',
    bio: 'Cuida de casos de canal com foco em conforto e previsibilidade.',
    createdAt: '2024-01-08T12:00:00.000Z',
  },
  {
    id: 'dent-bruno',
    clinicId: CLINIC.id,
    name: 'Dr. Bruno Sá',
    email: 'bruno@clareia.app',
    phone: '(11) 99522-6018',
    cro: 'CRO-SP 44.120',
    specialty: 'Implantodontia',
    role: 'dentist',
    status: 'inactive',
    tone: 'sand',
    bio: 'Atendimento em implantodontia. Atualmente em licença.',
    createdAt: '2023-09-02T12:00:00.000Z',
  },
]

interface SeedPatient {
  name: string
  email: string
  phone: string
  birthDate: string
  notes: string
  dentistId: string
  status?: Patient['status']
}

const PATIENT_SEEDS: SeedPatient[] = [
  {
    name: 'Ana Beatriz Souza',
    email: 'ana.souza@email.com',
    phone: '(11) 98812-4471',
    birthDate: '1991-03-14',
    notes: 'Sensibilidade nos dentes anteriores. Prefere horários pela manhã.',
    dentistId: 'dent-marina',
  },
  {
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    phone: '(11) 99145-8820',
    birthDate: '1985-07-22',
    notes: '',
    dentistId: 'dent-rafael',
  },
  {
    name: 'Helena Martins',
    email: 'helena.martins@email.com',
    phone: '(11) 98433-1912',
    birthDate: '1998-11-02',
    notes: 'Alergia a látex.',
    dentistId: 'dent-camila',
  },
  {
    name: 'Pedro Henrique Lima',
    email: 'pedro.lima@email.com',
    phone: '(11) 97612-5504',
    birthDate: '1979-01-30',
    notes: 'Tratamento de canal em andamento no dente 26.',
    dentistId: 'dent-marina',
  },
  {
    name: 'Juliana Castro',
    email: 'juliana.castro@email.com',
    phone: '(11) 99308-4417',
    birthDate: '1993-05-18',
    notes: '',
    dentistId: 'dent-rafael',
  },
  {
    name: 'Gabriel Rocha',
    email: 'gabriel.rocha@email.com',
    phone: '(11) 98221-7609',
    birthDate: '2001-09-09',
    notes: 'Usa aparelho fixo. Ajustes a cada 4 semanas.',
    dentistId: 'dent-camila',
  },
  {
    name: 'Beatriz Almeida',
    email: 'beatriz.almeida@email.com',
    phone: '(11) 99931-2276',
    birthDate: '1988-12-12',
    notes: 'Histórico de sensibilidade após clareamento.',
    dentistId: 'dent-marina',
  },
  {
    name: 'Thiago Mendes',
    email: 'thiago.mendes@email.com',
    phone: '(11) 98547-9930',
    birthDate: '1990-04-27',
    notes: 'Bruxismo — indicado placar noturno.',
    dentistId: 'dent-rafael',
  },
  {
    name: 'Larissa Pires',
    email: 'larissa.pires@email.com',
    phone: '(11) 99402-1188',
    birthDate: '1996-08-03',
    notes: '',
    dentistId: 'dent-camila',
  },
  {
    name: 'Rafaela Duarte',
    email: 'rafaela.duarte@email.com',
    phone: '(11) 98119-4432',
    birthDate: '1983-06-21',
    notes: 'Gestante — evitar radiografias.',
    dentistId: 'dent-marina',
  },
  {
    name: 'Gustavo Nogueira',
    email: 'gustavo.nogueira@email.com',
    phone: '(11) 99008-7715',
    birthDate: '1975-10-15',
    notes: '',
    dentistId: 'dent-rafael',
  },
  {
    name: 'Isabela Freitas',
    email: 'isabela.freitas@email.com',
    phone: '(11) 98625-3091',
    birthDate: '1999-02-08',
    notes: 'Ansiedade em atendimentos. Explicar cada etapa.',
    dentistId: 'dent-camila',
  },
  {
    name: 'Marcelo Tavares',
    email: 'marcelo.tavares@email.com',
    phone: '(11) 97730-6612',
    birthDate: '1968-03-05',
    notes: 'Hipertenso, uso contínuo de losartana.',
    dentistId: 'dent-marina',
  },
  {
    name: 'Sofia Ribeiro',
    email: 'sofia.ribeiro@email.com',
    phone: '(11) 99540-8821',
    birthDate: '2004-12-19',
    notes: '',
    dentistId: 'dent-rafael',
  },
  {
    name: 'Caio Barbosa',
    email: 'caio.barbosa@email.com',
    phone: '(11) 98372-1140',
    birthDate: '1992-07-11',
    notes: '',
    dentistId: 'dent-camila',
  },
  {
    name: 'Renata Lopes',
    email: 'renata.lopes@email.com',
    phone: '(11) 99804-5527',
    birthDate: '1987-09-25',
    notes: 'Sensibilidade a clareamento. Prefere produtos dessensibilizantes.',
    dentistId: 'dent-marina',
  },
  {
    name: 'Felipe Azevedo',
    email: 'felipe.azevedo@email.com',
    phone: '(11) 98166-3390',
    birthDate: '1981-05-06',
    notes: '',
    dentistId: 'dent-rafael',
  },
  {
    name: 'Manuela Cardoso',
    email: 'manuela.cardoso@email.com',
    phone: '(11) 99275-7406',
    birthDate: '2000-01-17',
    notes: '',
    dentistId: 'dent-camila',
  },
  {
    name: 'Paulo Menezes',
    email: 'paulo.menezes@email.com',
    phone: '(11) 97420-2218',
    birthDate: '1972-11-29',
    notes: 'Implante em avaliação na região posterior inferior.',
    dentistId: 'dent-bruno',
  },
  {
    name: 'Vera Santana',
    email: 'vera.santana@email.com',
    phone: '(11) 98901-3374',
    birthDate: '1965-04-13',
    notes: 'Acompanhamento de prótese parcial.',
    dentistId: 'dent-bruno',
    status: 'archived',
  },
]

const TYPE_POOLS: Record<string, AppointmentType[]> = {
  'dent-marina': ['evaluation', 'cleaning', 'whitening', 'return', 'urgency'],
  'dent-rafael': [
    'orthodontics',
    'orthodontics',
    'evaluation',
    'return',
    'cleaning',
  ],
  'dent-camila': ['root_canal', 'root_canal', 'evaluation', 'return', 'urgency'],
  'dent-bruno': ['implant', 'evaluation', 'return'],
}

const APPOINTMENT_NOTES = [
  '',
  '',
  '',
  'Paciente pediu confirmação por WhatsApp.',
  'Trazer radiografia anterior.',
  'Retorno pós-procedimento.',
]

function mulberry32(seed: number) {
  let value = seed
  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

function buildPatients(now: Date): Patient[] {
  return PATIENT_SEEDS.map((patient, index) => ({
    id: `patient-${String(index + 1).padStart(2, '0')}`,
    clinicId: CLINIC.id,
    dentistId: patient.dentistId,
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    birthDate: patient.birthDate,
    notes: patient.notes,
    status: patient.status ?? 'active',
    createdAt: new Date(
      now.getTime() - (40 + index * 9) * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }))
}

export function createSeedState(now = new Date()): ClinicState {
  const random = mulberry32(20261123)
  const today = todayISO(now)
  const patients = buildPatients(now)
  const appointments: Appointment[] = []
  let appointmentCounter = 0

  const timeSlots = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
  ]

  for (let offset = -14; offset <= 14; offset += 1) {
    const date = addDaysISO(today, offset)
    const weekDay = new Date(`${date}T12:00:00`).getDay()
    if (weekDay === 0) continue

    for (const dentist of DENTISTS) {
      if (dentist.status === 'inactive' && offset > -1) continue
      if (weekDay === 6 && dentist.id !== 'dent-marina') continue

      const availablePatients = patients.filter(
        (patient) =>
          patient.dentistId === dentist.id && patient.status === 'active',
      )
      if (availablePatients.length === 0) continue

      const targetCount =
        weekDay === 6
          ? 1
          : offset === 0
            ? 3
            : offset < -7 || offset > 7
              ? 1 + Math.floor(random() * 2)
              : 2

      const slots = shuffle(
        weekDay === 6 ? timeSlots.slice(0, 8) : timeSlots,
        random,
      )
      let createdForDay = 0

      for (const startTime of slots) {
        if (createdForDay >= targetCount) break

        const type =
          TYPE_POOLS[dentist.id][
            Math.floor(random() * TYPE_POOLS[dentist.id].length)
          ]
        const patient =
          availablePatients[
            Math.floor(random() * availablePatients.length)
          ]
        const durationMinutes = appointmentDurationByType[type]
        const candidate = {
          date,
          startTime,
          durationMinutes,
          dentistId: dentist.id,
          patientId: patient.id,
        }

        if (findDentistConflict(appointments, candidate)) continue
        if (findPatientConflict(appointments, candidate)) continue

        let status: AppointmentStatus
        if (offset < 0) {
          const roll = random()
          status = roll < 0.82 ? 'completed' : roll < 0.92 ? 'cancelled' : 'no_show'
        } else if (offset === 0) {
          const isPastTime =
            new Date(`${date}T${startTime}:00`).getTime() < now.getTime()
          const roll = random()
          if (isPastTime) {
            status =
              roll < 0.65
                ? 'completed'
                : roll < 0.85
                  ? 'confirmed'
                  : roll < 0.95
                    ? 'scheduled'
                    : 'no_show'
          } else {
            status = roll < 0.55 ? 'confirmed' : 'scheduled'
          }
        } else {
          const roll = random()
          status = roll < 0.45 ? 'confirmed' : roll < 0.95 ? 'scheduled' : 'cancelled'
        }

        appointmentCounter += 1
        appointments.push({
          id: `appointment-${String(appointmentCounter).padStart(3, '0')}`,
          clinicId: CLINIC.id,
          dentistId: dentist.id,
          patientId: patient.id,
          date,
          startTime,
          durationMinutes,
          type,
          status,
          notes: APPOINTMENT_NOTES[Math.floor(random() * APPOINTMENT_NOTES.length)],
          createdAt: new Date(
            now.getTime() - (offset < 0 ? 20 : 3) * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        createdForDay += 1
      }
    }
  }

  return {
    version: DB_VERSION,
    clinic: CLINIC,
    dentists: DENTISTS,
    patients,
    appointments,
    seededAt: now.toISOString(),
  }
}
