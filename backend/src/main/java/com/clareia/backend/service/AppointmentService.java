package com.clareia.backend.service;

import com.clareia.backend.config.ClareiaProperties;
import com.clareia.backend.domain.entity.Appointment;
import com.clareia.backend.domain.entity.Patient;
import com.clareia.backend.domain.enums.AppointmentStatus;
import com.clareia.backend.domain.enums.AppointmentType;
import com.clareia.backend.domain.util.AppointmentTimeUtil;
import com.clareia.backend.domain.util.Formatters;
import com.clareia.backend.domain.util.IdGenerator;
import com.clareia.backend.repository.AppointmentRepository;
import com.clareia.backend.repository.DentistRepository;
import com.clareia.backend.repository.PatientRepository;
import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.web.dto.AppointmentResponse;
import com.clareia.backend.web.dto.CommandDtos.AppointmentRequest;
import com.clareia.backend.web.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DentistRepository dentistRepository;
    private final PatientRepository patientRepository;
    private final DomainValidationSupport validation;
    private final ClareiaProperties properties;
    private final Clock clock;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            DentistRepository dentistRepository,
            PatientRepository patientRepository,
            DomainValidationSupport validation,
            ClareiaProperties properties,
            Clock clock
    ) {
        this.appointmentRepository = appointmentRepository;
        this.dentistRepository = dentistRepository;
        this.patientRepository = patientRepository;
        this.validation = validation;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listAppointments(
            AuthenticatedDentist principal,
            LocalDate from,
            LocalDate to,
            String dentistIdFilter,
            String patientIdFilter,
            AppointmentStatus statusFilter
    ) {
        List<Appointment> base;
        if (principal.isOwner()) {
            base = appointmentRepository.findAllByClinicIdOrderByDateAscStartTimeAsc(principal.clinicId());
        } else {
            base = appointmentRepository.findAllByClinicIdAndDentistIdOrderByDateAscStartTimeAsc(
                    principal.clinicId(), principal.id()
            );
        }

        return base.stream()
                .filter(a -> from == null || !a.getDate().isBefore(from))
                .filter(a -> to == null || !a.getDate().isAfter(to))
                .filter(a -> !principal.isOwner() || dentistIdFilter == null || dentistIdFilter.isBlank()
                        || "all".equalsIgnoreCase(dentistIdFilter) || a.getDentistId().equals(dentistIdFilter))
                .filter(a -> patientIdFilter == null || patientIdFilter.isBlank()
                        || a.getPatientId().equals(patientIdFilter))
                .filter(a -> statusFilter == null || a.getStatus() == statusFilter)
                .map(AppointmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(AuthenticatedDentist principal, String appointmentId) {
        return AppointmentResponse.from(findAndAuthorize(principal, appointmentId));
    }

    @Transactional
    public AppointmentResponse createAppointment(AuthenticatedDentist principal, AppointmentRequest request) {
        ValidatedAppointment data = validateAndResolve(principal, request, null, true);
        checkConflicts(principal.clinicId(), data.dentistId(), data.patientId(), data.date(), data.startTime(), data.durationMinutes(), null);

        Appointment appointment = new Appointment(
                IdGenerator.newAppointmentId(),
                principal.clinicId(),
                data.dentistId(),
                data.patientId(),
                data.date(),
                data.startTime(),
                data.durationMinutes(),
                data.type(),
                AppointmentStatus.SCHEDULED,
                data.notes(),
                Instant.now(clock)
        );
        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse updateAppointment(
            AuthenticatedDentist principal,
            String appointmentId,
            AppointmentRequest request
    ) {
        Appointment existing = findAndAuthorize(principal, appointmentId);

        boolean slotChanged = !existing.getDate().toString().equals(request.date())
                || !existing.getStartTime().equals(request.startTime());

        ValidatedAppointment data = validateAndResolve(principal, request, existing, slotChanged);

        if (existing.getStatus().isActiveSlot()) {
            checkConflicts(
                    principal.clinicId(),
                    data.dentistId(),
                    data.patientId(),
                    data.date(),
                    data.startTime(),
                    data.durationMinutes(),
                    existing.getId()
            );
        }

        existing.setDentistId(data.dentistId());
        existing.setPatientId(data.patientId());
        existing.setDate(data.date());
        existing.setStartTime(data.startTime());
        existing.setDurationMinutes(data.durationMinutes());
        existing.setType(data.type());
        existing.setNotes(data.notes());

        return AppointmentResponse.from(appointmentRepository.save(existing));
    }

    @Transactional
    public AppointmentResponse updateStatus(
            AuthenticatedDentist principal,
            String appointmentId,
            AppointmentStatus newStatus
    ) {
        Appointment existing = findAndAuthorize(principal, appointmentId);

        // Reativar uma consulta cancelada exige checar conflitos novamente.
        if (existing.getStatus() == AppointmentStatus.CANCELLED && newStatus.isActiveSlot()) {
            checkConflicts(
                    principal.clinicId(),
                    existing.getDentistId(),
                    existing.getPatientId(),
                    existing.getDate(),
                    existing.getStartTime(),
                    existing.getDurationMinutes(),
                    existing.getId()
            );
        }

        existing.setStatus(newStatus);
        return AppointmentResponse.from(appointmentRepository.save(existing));
    }

    private Appointment findAndAuthorize(AuthenticatedDentist principal, String appointmentId) {
        Appointment appointment = appointmentRepository.findByIdAndClinicId(appointmentId, principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Consulta não encontrada."));
        if (!principal.isOwner() && !appointment.getDentistId().equals(principal.id())) {
            throw ApiException.forbidden("Você só pode gerenciar consultas da sua própria agenda.");
        }
        return appointment;
    }

    private ValidatedAppointment validateAndResolve(
            AuthenticatedDentist principal,
            AppointmentRequest request,
            Appointment existing,
            boolean checkNotInPast
    ) {
        Map<String, String> errors = new LinkedHashMap<>();

        LocalDate date = validation.requireIsoDate(request.date(), "date", errors);
        String startTime = validation.requireStartTime(request.startTime(), "startTime", errors);
        AppointmentType type = request.type();
        if (type == null) {
            errors.put("type", "Escolha o procedimento.");
        }

        int duration = request.durationMinutes() != null
                ? request.durationMinutes()
                : (type != null ? type.getDefaultDurationMinutes() : 30);
        if (duration < 15 || duration > 240) {
            errors.put("durationMinutes", "A duração deve ficar entre 15 e 240 minutos.");
        }

        String notes = Formatters.normalizeOptionalText(request.notes());
        if (notes != null && notes.length() > 800) {
            errors.put("notes", "Use até 800 caracteres.");
        }

        String targetDentistId;
        if (principal.isOwner()) {
            targetDentistId = request.dentistId();
            if (targetDentistId == null || targetDentistId.isBlank()) {
                errors.put("dentistId", "Escolha o dentista.");
            } else if (dentistRepository.findByIdAndClinicId(targetDentistId, principal.clinicId()).isEmpty()) {
                errors.put("dentistId", "Dentista não encontrado nesta clínica.");
            }
        } else {
            if (request.dentistId() != null && !request.dentistId().isBlank()
                    && !request.dentistId().equals(principal.id())) {
                throw ApiException.forbidden("Você só pode agendar na própria agenda.");
            }
            targetDentistId = principal.id();
        }

        Patient patient = null;
        if (request.patientId() == null || request.patientId().isBlank()) {
            errors.put("patientId", "Escolha o paciente.");
        } else {
            Optional<Patient> found = patientRepository.findByIdAndClinicId(request.patientId(), principal.clinicId());
            if (found.isEmpty()) {
                errors.put("patientId", "Paciente não encontrado nesta clínica.");
            } else {
                patient = found.get();
                if (!principal.isOwner() && !patient.getDentistId().equals(principal.id())) {
                    throw ApiException.forbidden("Você não pode agendar consultas para pacientes de outro dentista.");
                }
            }
        }

        if (checkNotInPast && date != null && !startTime.isEmpty()) {
            Instant endInstant = AppointmentTimeUtil.endInstant(date, startTime, duration, properties.zoneId());
            if (endInstant.isBefore(Instant.now(clock))) {
                errors.put("date", "Escolha uma data e um horário que ainda não passaram.");
            }
        }

        validation.throwIfErrors(errors);

        return new ValidatedAppointment(
                targetDentistId,
                patient.getId(),
                date,
                startTime,
                duration,
                type,
                notes
        );
    }

    private void checkConflicts(
            String clinicId,
            String dentistId,
            String patientId,
            LocalDate date,
            String startTime,
            int durationMinutes,
            String excludeId
    ) {
        List<Appointment> dentistDayAppointments = appointmentRepository
                .findAllByClinicIdAndDentistIdAndDateAndStatusNot(clinicId, dentistId, date, AppointmentStatus.CANCELLED);

        for (Appointment other : dentistDayAppointments) {
            if (other.getId().equals(excludeId)) continue;
            if (AppointmentTimeUtil.overlaps(date, startTime, durationMinutes,
                    other.getDate(), other.getStartTime(), other.getDurationMinutes())) {
                String end = AppointmentTimeUtil.endTimeOf(other.getStartTime(), other.getDurationMinutes());
                throw ApiException.conflict(
                        "startTime",
                        "O dentista já tem consulta das " + other.getStartTime() + " às " + end + "."
                );
            }
        }

        List<Appointment> patientDayAppointments = appointmentRepository
                .findAllByClinicIdAndPatientIdAndDateAndStatusNot(clinicId, patientId, date, AppointmentStatus.CANCELLED);

        for (Appointment other : patientDayAppointments) {
            if (other.getId().equals(excludeId)) continue;
            if (AppointmentTimeUtil.overlaps(date, startTime, durationMinutes,
                    other.getDate(), other.getStartTime(), other.getDurationMinutes())) {
                String end = AppointmentTimeUtil.endTimeOf(other.getStartTime(), other.getDurationMinutes());
                throw ApiException.conflict(
                        "patientId",
                        "Este paciente já tem consulta das " + other.getStartTime() + " às " + end + "."
                );
            }
        }
    }

    private record ValidatedAppointment(
            String dentistId,
            String patientId,
            LocalDate date,
            String startTime,
            int durationMinutes,
            AppointmentType type,
            String notes
    ) {}
}
