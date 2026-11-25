package com.clareia.backend.service;

import com.clareia.backend.config.ClareiaProperties;
import com.clareia.backend.domain.entity.Appointment;
import com.clareia.backend.domain.entity.Clinic;
import com.clareia.backend.domain.entity.Dentist;
import com.clareia.backend.domain.entity.Patient;
import com.clareia.backend.domain.enums.AppointmentStatus;
import com.clareia.backend.domain.enums.AppointmentType;
import com.clareia.backend.domain.enums.DentistRole;
import com.clareia.backend.domain.enums.DentistStatus;
import com.clareia.backend.domain.enums.DentistTone;
import com.clareia.backend.domain.enums.PatientStatus;
import com.clareia.backend.domain.util.AppointmentTimeUtil;
import com.clareia.backend.repository.AppointmentRepository;
import com.clareia.backend.repository.ClinicRepository;
import com.clareia.backend.repository.DentistRepository;
import com.clareia.backend.repository.PatientRepository;
import com.clareia.backend.security.JwtService;
import com.clareia.backend.web.dto.AuthDtos.AuthResponse;
import com.clareia.backend.web.dto.AuthDtos.DemoAccountResponse;
import com.clareia.backend.web.dto.ClinicResponse;
import com.clareia.backend.web.dto.DentistResponse;
import com.clareia.backend.web.error.ApiException;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class DemoSeedService {

    public static final String DEMO_CLINIC_ID = "clinic-clareia";
    public static final String DEMO_OWNER_ID = "dent-marina";

    private static final List<String> TIME_SLOTS = List.of(
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    );

    private static final List<String> APPOINTMENT_NOTES = List.of(
            "", "", "",
            "Paciente pediu confirmação por WhatsApp.",
            "Trazer radiografia anterior.",
            "Retorno pós-procedimento."
    );

    private static final Map<String, List<AppointmentType>> TYPE_POOLS = Map.of(
            "dent-marina", List.of(AppointmentType.EVALUATION, AppointmentType.CLEANING, AppointmentType.WHITENING, AppointmentType.RETURN, AppointmentType.URGENCY),
            "dent-rafael", List.of(AppointmentType.ORTHODONTICS, AppointmentType.ORTHODONTICS, AppointmentType.EVALUATION, AppointmentType.RETURN, AppointmentType.CLEANING),
            "dent-camila", List.of(AppointmentType.ROOT_CANAL, AppointmentType.ROOT_CANAL, AppointmentType.EVALUATION, AppointmentType.RETURN, AppointmentType.URGENCY),
            "dent-bruno", List.of(AppointmentType.IMPLANT, AppointmentType.EVALUATION, AppointmentType.RETURN)
    );

    private final ClinicRepository clinicRepository;
    private final DentistRepository dentistRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ClareiaProperties properties;
    private final Clock clock;

    public DemoSeedService(
            ClinicRepository clinicRepository,
            DentistRepository dentistRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ClareiaProperties properties,
            Clock clock
    ) {
        this.clinicRepository = clinicRepository;
        this.dentistRepository = dentistRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.properties = properties;
        this.clock = clock;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedIfConfigured() {
        if (properties.demo() == null || !properties.demo().enabled() || !properties.demo().seedOnStartup()) {
            return;
        }
        if (!clinicRepository.existsById(DEMO_CLINIC_ID)) {
            seedDemoClinic();
        }
    }

    @Transactional(readOnly = true)
    public List<DemoAccountResponse> listDemoAccounts() {
        if (properties.demo() == null || !properties.demo().enabled()) {
            return List.of();
        }
        return dentistRepository.findAllByClinicIdAndStatusOrderByCreatedAtAsc(DEMO_CLINIC_ID, DentistStatus.ACTIVE)
                .stream()
                .sorted(Comparator.comparing(d -> d.getRole() == DentistRole.OWNER ? 0 : 1))
                .limit(3)
                .map(DemoAccountResponse::from)
                .toList();
    }

    @Transactional
    public AuthResponse resetDemo() {
        if (properties.demo() == null || !properties.demo().enabled()) {
            throw ApiException.forbidden("O modo demonstração está desabilitado neste ambiente.");
        }

        appointmentRepository.deleteAllByClinicId(DEMO_CLINIC_ID);
        appointmentRepository.flush();
        patientRepository.deleteAllByClinicId(DEMO_CLINIC_ID);
        patientRepository.flush();
        dentistRepository.deleteAllByClinicId(DEMO_CLINIC_ID);
        dentistRepository.flush();
        if (clinicRepository.existsById(DEMO_CLINIC_ID)) {
            clinicRepository.deleteById(DEMO_CLINIC_ID);
            clinicRepository.flush();
        }

        Clinic clinic = seedDemoClinic();
        Dentist owner = dentistRepository.findById(DEMO_OWNER_ID)
                .orElseThrow(() -> ApiException.notFound("Conta demo principal não encontrada."));

        String token = jwtService.generateToken(owner);
        return new AuthResponse(
                token,
                jwtService.getExpirationSeconds(),
                DentistResponse.from(owner),
                ClinicResponse.from(clinic)
        );
    }

    private Clinic seedDemoClinic() {
        String demoPassword = properties.demo().defaultPassword();
        if (demoPassword == null || demoPassword.isBlank()) {
            throw new IllegalStateException(
                    "CLAREIA_DEMO_DEFAULT_PASSWORD precisa estar definida no .env quando CLAREIA_DEMO_ENABLED=true."
            );
        }
        String passwordHash = passwordEncoder.encode(demoPassword);

        Clinic clinic = new Clinic(
                DEMO_CLINIC_ID,
                "Clareia Odontologia",
                "Rua das Acácias, 128 — Vila Madalena, São Paulo",
                "12.345.678/0001-95",
                "(11) 3082-4410",
                "ola@clareia.app",
                DEMO_OWNER_ID,
                Instant.parse("2023-02-10T12:00:00Z")
        );
        clinicRepository.saveAndFlush(clinic);

        List<Dentist> dentists = List.of(
                new Dentist(
                        "dent-marina", DEMO_CLINIC_ID, "Dra. Marina Prado", "marina@clareia.app", passwordHash,
                        "(11) 99812-4401", "CRO-SP 48.210", "Clínica geral & estética",
                        DentistRole.OWNER, DentistStatus.ACTIVE, DentistTone.TEAL,
                        "Fundadora da Clareia. Acredita em odontologia sem pressa, com tempo para escutar.",
                        Instant.parse("2023-02-10T12:00:00Z")
                ),
                new Dentist(
                        "dent-rafael", DEMO_CLINIC_ID, "Dr. Rafael Nunes", "rafael@clareia.app", passwordHash,
                        "(11) 99775-1290", "CRO-SP 51.932", "Ortodontia",
                        DentistRole.DENTIST, DentistStatus.ACTIVE, DentistTone.SKY,
                        "Especialista em alinhadores e ortodontia preventiva.",
                        Instant.parse("2023-06-18T12:00:00Z")
                ),
                new Dentist(
                        "dent-camila", DEMO_CLINIC_ID, "Dra. Camila Reis", "camila@clareia.app", passwordHash,
                        "(11) 99640-7733", "CRO-SP 55.401", "Endodontia",
                        DentistRole.DENTIST, DentistStatus.ACTIVE, DentistTone.MINT,
                        "Cuida de casos de canal com foco em conforto e previsibilidade.",
                        Instant.parse("2024-01-08T12:00:00Z")
                ),
                new Dentist(
                        "dent-bruno", DEMO_CLINIC_ID, "Dr. Bruno Sá", "bruno@clareia.app", passwordHash,
                        "(11) 99522-6018", "CRO-SP 44.120", "Implantodontia",
                        DentistRole.DENTIST, DentistStatus.INACTIVE, DentistTone.SAND,
                        "Atendimento em implantodontia. Atualmente em licença.",
                        Instant.parse("2023-09-02T12:00:00Z")
                )
        );
        dentistRepository.saveAllAndFlush(dentists);

        Instant now = Instant.now(clock);
        LocalDate today = LocalDate.now(clock.withZone(properties.zoneId()));
        List<Patient> patients = buildDemoPatients(now);
        patientRepository.saveAllAndFlush(patients);

        List<Appointment> appointments = buildDemoAppointments(dentists, patients, today, now);
        appointmentRepository.saveAllAndFlush(appointments);

        return clinic;
    }

    private List<Patient> buildDemoPatients(Instant now) {
        record SeedPatient(String name, String email, String phone, String birthDate, String notes, String dentistId, PatientStatus status) {}
        List<SeedPatient> seeds = List.of(
                new SeedPatient("Ana Beatriz Souza", "ana.souza@email.com", "(11) 98812-4471", "1991-03-14", "Sensibilidade nos dentes anteriores. Prefere horários pela manhã.", "dent-marina", PatientStatus.ACTIVE),
                new SeedPatient("Lucas Ferreira", "lucas.ferreira@email.com", "(11) 99145-8820", "1985-07-22", "", "dent-rafael", PatientStatus.ACTIVE),
                new SeedPatient("Helena Martins", "helena.martins@email.com", "(11) 98433-1912", "1998-11-02", "Alergia a látex.", "dent-camila", PatientStatus.ACTIVE),
                new SeedPatient("Pedro Henrique Lima", "pedro.lima@email.com", "(11) 97612-5504", "1979-01-30", "Tratamento de canal em andamento no dente 26.", "dent-marina", PatientStatus.ACTIVE),
                new SeedPatient("Juliana Castro", "juliana.castro@email.com", "(11) 99308-4417", "1993-05-18", "", "dent-rafael", PatientStatus.ACTIVE),
                new SeedPatient("Gabriel Rocha", "gabriel.rocha@email.com", "(11) 98221-7609", "2001-09-09", "Usa aparelho fixo. Ajustes a cada 4 semanas.", "dent-camila", PatientStatus.ACTIVE),
                new SeedPatient("Beatriz Almeida", "beatriz.almeida@email.com", "(11) 99931-2276", "1988-12-12", "Histórico de sensibilidade após clareamento.", "dent-marina", PatientStatus.ACTIVE),
                new SeedPatient("Thiago Mendes", "thiago.mendes@email.com", "(11) 98547-9930", "1990-04-27", "Bruxismo — indicado placa noturna.", "dent-rafael", PatientStatus.ACTIVE),
                new SeedPatient("Larissa Pires", "larissa.pires@email.com", "(11) 99402-1188", "1996-08-03", "", "dent-camila", PatientStatus.ACTIVE),
                new SeedPatient("Rafaela Duarte", "rafaela.duarte@email.com", "(11) 98119-4432", "1983-06-21", "Gestante — evitar radiografias.", "dent-marina", PatientStatus.ACTIVE),
                new SeedPatient("Gustavo Nogueira", "gustavo.nogueira@email.com", "(11) 99008-7715", "1975-10-15", "", "dent-rafael", PatientStatus.ACTIVE),
                new SeedPatient("Isabela Freitas", "isabela.freitas@email.com", "(11) 98625-3091", "1999-02-08", "Ansiedade em atendimentos. Explicar cada etapa.", "dent-camila", PatientStatus.ACTIVE),
                new SeedPatient("Marcelo Tavares", "marcelo.tavares@email.com", "(11) 97730-6612", "1968-03-05", "Hipertenso, uso contínuo de losartana.", "dent-marina", PatientStatus.ACTIVE),
                new SeedPatient("Sofia Ribeiro", "sofia.ribeiro@email.com", "(11) 99540-8821", "2004-12-19", "", "dent-rafael", PatientStatus.ACTIVE),
                new SeedPatient("Caio Barbosa", "caio.barbosa@email.com", "(11) 98372-1140", "1992-07-11", "", "dent-camila", PatientStatus.ACTIVE),
                new SeedPatient("Renata Lopes", "renata.lopes@email.com", "(11) 99804-5527", "1987-09-25", "Sensibilidade a clareamento. Prefere produtos dessensibilizantes.", "dent-marina", PatientStatus.ACTIVE),
                new SeedPatient("Felipe Azevedo", "felipe.azevedo@email.com", "(11) 98166-3390", "1981-05-06", "", "dent-rafael", PatientStatus.ACTIVE),
                new SeedPatient("Manuela Cardoso", "manuela.cardoso@email.com", "(11) 99275-7406", "2000-01-17", "", "dent-camila", PatientStatus.ACTIVE),
                new SeedPatient("Paulo Menezes", "paulo.menezes@email.com", "(11) 97420-2218", "1972-11-29", "Implante em avaliação na região posterior inferior.", "dent-bruno", PatientStatus.ACTIVE),
                new SeedPatient("Vera Santana", "vera.santana@email.com", "(11) 98901-3374", "1965-04-13", "Acompanhamento de prótese parcial.", "dent-bruno", PatientStatus.ARCHIVED)
        );

        List<Patient> result = new ArrayList<>();
        for (int i = 0; i < seeds.size(); i++) {
            SeedPatient s = seeds.get(i);
            result.add(new Patient(
                    String.format("patient-%02d", i + 1),
                    DEMO_CLINIC_ID,
                    s.dentistId(),
                    s.name(),
                    s.email(),
                    s.phone(),
                    LocalDate.parse(s.birthDate()),
                    s.notes(),
                    s.status(),
                    now.minus(40L + i * 9L, ChronoUnit.DAYS)
            ));
        }
        return result;
    }

    private List<Appointment> buildDemoAppointments(
            List<Dentist> dentists,
            List<Patient> patients,
            LocalDate today,
            Instant now
    ) {
        Random random = new Random(20261123L);
        List<Appointment> appointments = new ArrayList<>();
        int counter = 0;

        for (int offset = -14; offset <= 14; offset++) {
            LocalDate date = today.plusDays(offset);
            DayOfWeek dow = date.getDayOfWeek();
            if (dow == DayOfWeek.SUNDAY) continue;

            for (Dentist dentist : dentists) {
                if (dentist.getStatus() == DentistStatus.INACTIVE && offset > -1) continue;
                if (dow == DayOfWeek.SATURDAY && !DEMO_OWNER_ID.equals(dentist.getId())) continue;

                List<Patient> available = patients.stream()
                        .filter(p -> p.getDentistId().equals(dentist.getId()) && p.getStatus() == PatientStatus.ACTIVE)
                        .toList();
                if (available.isEmpty()) continue;

                int targetCount = dow == DayOfWeek.SATURDAY
                        ? 1
                        : (offset == 0 ? 3 : (offset < -7 || offset > 7 ? 1 + random.nextInt(2) : 2));

                List<String> slots = new ArrayList<>(dow == DayOfWeek.SATURDAY ? TIME_SLOTS.subList(0, 8) : TIME_SLOTS);
                Collections.shuffle(slots, random);

                int createdForDay = 0;
                List<AppointmentType> pool = TYPE_POOLS.getOrDefault(dentist.getId(), List.of(AppointmentType.EVALUATION));

                for (String startTime : slots) {
                    if (createdForDay >= targetCount) break;

                    AppointmentType type = pool.get(random.nextInt(pool.size()));
                    Patient patient = available.get(random.nextInt(available.size()));
                    int duration = type.getDefaultDurationMinutes();

                    boolean conflict = appointments.stream()
                            .filter(a -> a.getStatus().isActiveSlot())
                            .anyMatch(a -> (a.getDentistId().equals(dentist.getId()) || a.getPatientId().equals(patient.getId()))
                                    && AppointmentTimeUtil.overlaps(date, startTime, duration,
                                    a.getDate(), a.getStartTime(), a.getDurationMinutes()));
                    if (conflict) continue;

                    AppointmentStatus status = pickDemoStatus(offset, date, startTime, now, random);
                    String rawNote = APPOINTMENT_NOTES.get(random.nextInt(APPOINTMENT_NOTES.size()));
                    String note = rawNote.isEmpty() ? null : rawNote;

                    counter++;
                    appointments.add(new Appointment(
                            String.format("appointment-%03d", counter),
                            DEMO_CLINIC_ID,
                            dentist.getId(),
                            patient.getId(),
                            date,
                            startTime,
                            duration,
                            type,
                            status,
                            note,
                            now.minus(offset < 0 ? 20L : 3L, ChronoUnit.DAYS)
                    ));
                    createdForDay++;
                }
            }
        }
        return appointments;
    }

    private AppointmentStatus pickDemoStatus(int offset, LocalDate date, String startTime, Instant now, Random random) {
        double roll = random.nextDouble();
        if (offset < 0) {
            return roll < 0.82 ? AppointmentStatus.COMPLETED : (roll < 0.92 ? AppointmentStatus.CANCELLED : AppointmentStatus.NO_SHOW);
        }
        if (offset == 0) {
            Instant slotStart = LocalDateTime.of(date, LocalTime.parse(startTime))
                    .atZone(properties.zoneId())
                    .toInstant();
            if (slotStart.isBefore(now)) {
                return roll < 0.65 ? AppointmentStatus.COMPLETED
                        : (roll < 0.85 ? AppointmentStatus.CONFIRMED
                        : (roll < 0.95 ? AppointmentStatus.SCHEDULED : AppointmentStatus.NO_SHOW));
            }
            return roll < 0.55 ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED;
        }
        return roll < 0.45 ? AppointmentStatus.CONFIRMED : (roll < 0.95 ? AppointmentStatus.SCHEDULED : AppointmentStatus.CANCELLED);
    }
}
