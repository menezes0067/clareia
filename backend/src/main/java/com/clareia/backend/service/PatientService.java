package com.clareia.backend.service;

import com.clareia.backend.config.ClareiaProperties;
import com.clareia.backend.domain.entity.Patient;
import com.clareia.backend.domain.enums.PatientStatus;
import com.clareia.backend.domain.util.Formatters;
import com.clareia.backend.domain.util.IdGenerator;
import com.clareia.backend.repository.DentistRepository;
import com.clareia.backend.repository.PatientRepository;
import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.web.dto.CommandDtos.PatientRequest;
import com.clareia.backend.web.dto.PatientResponse;
import com.clareia.backend.web.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final DentistRepository dentistRepository;
    private final DomainValidationSupport validation;
    private final ClareiaProperties properties;
    private final Clock clock;

    public PatientService(
            PatientRepository patientRepository,
            DentistRepository dentistRepository,
            DomainValidationSupport validation,
            ClareiaProperties properties,
            Clock clock
    ) {
        this.patientRepository = patientRepository;
        this.dentistRepository = dentistRepository;
        this.validation = validation;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> listPatients(
            AuthenticatedDentist principal,
            PatientStatus statusFilter,
            String dentistIdFilter,
            String query
    ) {
        List<Patient> base;
        if (principal.isOwner()) {
            base = patientRepository.findAllByClinicIdOrderByCreatedAtDesc(principal.clinicId());
        } else {
            base = patientRepository.findAllByClinicIdAndDentistIdOrderByCreatedAtDesc(
                    principal.clinicId(), principal.id()
            );
        }

        String normalizedQuery = normalizeSearch(query);
        return base.stream()
                .filter(p -> statusFilter == null || p.getStatus() == statusFilter)
                .filter(p -> !principal.isOwner() || dentistIdFilter == null || dentistIdFilter.isBlank()
                        || "all".equalsIgnoreCase(dentistIdFilter) || p.getDentistId().equals(dentistIdFilter))
                .filter(p -> normalizedQuery.isEmpty()
                        || normalizeSearch(p.getName()).contains(normalizedQuery)
                        || normalizeSearch(p.getEmail()).contains(normalizedQuery)
                        || normalizeSearch(p.getPhone()).contains(normalizedQuery)
                        || normalizeSearch(p.getNotes()).contains(normalizedQuery))
                .map(PatientResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatient(AuthenticatedDentist principal, String patientId) {
        Patient patient = findAndAuthorize(principal, patientId);
        return PatientResponse.from(patient);
    }

    @Transactional
    public PatientResponse createPatient(AuthenticatedDentist principal, PatientRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        String name = validation.requireName(request.name(), "name", errors);
        String email = validation.requireEmail(request.email(), "email", errors);
        String phone = validation.requirePhone(request.phone(), "phone", errors);
        LocalDate birthDate = validation.requireIsoDate(request.birthDate(), "birthDate", errors);
        if (birthDate != null && birthDate.isAfter(LocalDate.now(clock.withZone(properties.zoneId())))) {
            errors.put("birthDate", "A data não pode estar no futuro.");
        }
        String notes = Formatters.normalizeNotesRequired(request.notes());
        if (notes.length() > 1200) {
            errors.put("notes", "Use até 1200 caracteres.");
        }

        String targetDentistId = resolveDentistId(principal, request.dentistId(), errors);
        validation.throwIfErrors(errors);

        if (patientRepository.existsByClinicIdAndEmailIgnoreCase(principal.clinicId(), email)) {
            throw ApiException.conflict("email", "Já existe um paciente com este e-mail.");
        }

        Patient patient = new Patient(
                IdGenerator.newPatientId(),
                principal.clinicId(),
                targetDentistId,
                name,
                email,
                phone,
                birthDate,
                notes,
                PatientStatus.ACTIVE,
                Instant.now(clock)
        );
        return PatientResponse.from(patientRepository.save(patient));
    }

    @Transactional
    public PatientResponse updatePatient(AuthenticatedDentist principal, String patientId, PatientRequest request) {
        Patient patient = findAndAuthorize(principal, patientId);

        Map<String, String> errors = new LinkedHashMap<>();
        String name = validation.requireName(request.name(), "name", errors);
        String email = validation.requireEmail(request.email(), "email", errors);
        String phone = validation.requirePhone(request.phone(), "phone", errors);
        LocalDate birthDate = validation.requireIsoDate(request.birthDate(), "birthDate", errors);
        if (birthDate != null && birthDate.isAfter(LocalDate.now(clock.withZone(properties.zoneId())))) {
            errors.put("birthDate", "A data não pode estar no futuro.");
        }
        String notes = Formatters.normalizeNotesRequired(request.notes());
        if (notes.length() > 1200) {
            errors.put("notes", "Use até 1200 caracteres.");
        }

        String targetDentistId = principal.isOwner()
                ? resolveDentistId(principal, request.dentistId(), errors)
                : principal.id();
        validation.throwIfErrors(errors);

        if (patientRepository.existsByClinicIdAndEmailIgnoreCaseAndIdNot(principal.clinicId(), email, patient.getId())) {
            throw ApiException.conflict("email", "Já existe um paciente com este e-mail.");
        }

        patient.setName(name);
        patient.setEmail(email);
        patient.setPhone(phone);
        patient.setBirthDate(birthDate);
        patient.setDentistId(targetDentistId);
        patient.setNotes(notes);

        return PatientResponse.from(patientRepository.save(patient));
    }

    @Transactional
    public PatientResponse archivePatient(AuthenticatedDentist principal, String patientId) {
        Patient patient = findAndAuthorize(principal, patientId);
        patient.setStatus(PatientStatus.ARCHIVED);
        return PatientResponse.from(patientRepository.save(patient));
    }

    @Transactional
    public PatientResponse restorePatient(AuthenticatedDentist principal, String patientId) {
        Patient patient = findAndAuthorize(principal, patientId);
        patient.setStatus(PatientStatus.ACTIVE);
        return PatientResponse.from(patientRepository.save(patient));
    }

    private Patient findAndAuthorize(AuthenticatedDentist principal, String patientId) {
        Patient patient = patientRepository.findByIdAndClinicId(patientId, principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Paciente não encontrado."));
        if (!principal.isOwner() && !patient.getDentistId().equals(principal.id())) {
            throw ApiException.forbidden("Esta ficha pertence a outro profissional da clínica.");
        }
        return patient;
    }

    private String resolveDentistId(AuthenticatedDentist principal, String requestedDentistId, Map<String, String> errors) {
        if (!principal.isOwner()) {
            return principal.id();
        }
        if (requestedDentistId == null || requestedDentistId.isBlank()) {
            errors.put("dentistId", "Escolha o dentista responsável.");
            return "";
        }
        boolean existsInClinic = dentistRepository.findByIdAndClinicId(requestedDentistId, principal.clinicId()).isPresent();
        if (!existsInClinic) {
            errors.put("dentistId", "Dentista responsável não encontrado nesta clínica.");
            return "";
        }
        return requestedDentistId;
    }

    private static String normalizeSearch(String value) {
        if (value == null || value.isBlank()) return "";
        String decomposed = Normalizer.normalize(value.trim(), Normalizer.Form.NFD);
        return decomposed.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").toLowerCase(Locale.ROOT);
    }
}
