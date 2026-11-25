package com.clareia.backend.service;

import com.clareia.backend.domain.entity.Dentist;
import com.clareia.backend.domain.enums.DentistRole;
import com.clareia.backend.domain.enums.DentistStatus;
import com.clareia.backend.domain.enums.DentistTone;
import com.clareia.backend.domain.util.IdGenerator;
import com.clareia.backend.repository.DentistRepository;
import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.web.dto.CommandDtos.DentistRequest;
import com.clareia.backend.web.dto.DentistResponse;
import com.clareia.backend.web.error.ApiException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DentistService {

    private final DentistRepository dentistRepository;
    private final PasswordEncoder passwordEncoder;
    private final DomainValidationSupport validation;
    private final Clock clock;

    public DentistService(
            DentistRepository dentistRepository,
            PasswordEncoder passwordEncoder,
            DomainValidationSupport validation,
            Clock clock
    ) {
        this.dentistRepository = dentistRepository;
        this.passwordEncoder = passwordEncoder;
        this.validation = validation;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<DentistResponse> listDentists(AuthenticatedDentist principal, DentistStatus statusFilter, String query) {
        List<Dentist> base;
        if (principal.isOwner()) {
            base = dentistRepository.findAllByClinicIdOrderByCreatedAtAsc(principal.clinicId());
        } else {
            base = dentistRepository.findByIdAndClinicId(principal.id(), principal.clinicId())
                    .map(List::of)
                    .orElse(List.of());
        }

        String normalizedQuery = normalizeSearch(query);
        return base.stream()
                .filter(d -> statusFilter == null || d.getStatus() == statusFilter)
                .filter(d -> normalizedQuery.isEmpty()
                        || normalizeSearch(d.getName()).contains(normalizedQuery)
                        || normalizeSearch(d.getEmail()).contains(normalizedQuery)
                        || normalizeSearch(d.getSpecialty()).contains(normalizedQuery)
                        || normalizeSearch(d.getCro()).contains(normalizedQuery))
                .map(DentistResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DentistResponse getDentist(AuthenticatedDentist principal, String dentistId) {
        Dentist dentist = dentistRepository.findByIdAndClinicId(dentistId, principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Dentista não encontrado."));
        if (!principal.isOwner() && !dentist.getId().equals(principal.id())) {
            throw ApiException.forbidden("Você não tem permissão para visualizar este profissional.");
        }
        return DentistResponse.from(dentist);
    }

    @Transactional
    public DentistResponse createDentist(AuthenticatedDentist principal, DentistRequest request) {
        requireOwner(principal);

        Map<String, String> errors = new LinkedHashMap<>();
        String name = validation.requireName(request.name(), "name", errors);
        String email = validation.requireEmail(request.email(), "email", errors);
        String phone = validation.requirePhone(request.phone(), "phone", errors);
        String cro = validation.requireCro(request.cro(), "cro", errors);
        String specialty = validation.requireSpecialty(request.specialty(), "specialty", errors);
        String bio = validation.optionalBio(request.bio(), "bio", errors);
        String password = validation.resolveNewAccountPassword(request.password(), "password", errors);
        validation.throwIfErrors(errors);

        if (dentistRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("email", "Já existe um profissional com este e-mail.");
        }

        int existingCount = dentistRepository.countByClinicId(principal.clinicId());
        Dentist dentist = new Dentist(
                IdGenerator.newDentistId(),
                principal.clinicId(),
                name,
                email,
                passwordEncoder.encode(password),
                phone,
                cro,
                specialty,
                DentistRole.DENTIST,
                DentistStatus.ACTIVE,
                DentistTone.forIndex(existingCount),
                bio,
                Instant.now(clock)
        );
        return DentistResponse.from(dentistRepository.save(dentist));
    }

    @Transactional
    public DentistResponse updateDentist(AuthenticatedDentist principal, String dentistId, DentistRequest request) {
        requireOwner(principal);

        Dentist dentist = dentistRepository.findByIdAndClinicId(dentistId, principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Dentista não encontrado."));

        Map<String, String> errors = new LinkedHashMap<>();
        String name = validation.requireName(request.name(), "name", errors);
        String email = validation.requireEmail(request.email(), "email", errors);
        String phone = validation.requirePhone(request.phone(), "phone", errors);
        String cro = validation.requireCro(request.cro(), "cro", errors);
        String specialty = validation.requireSpecialty(request.specialty(), "specialty", errors);
        String bio = validation.optionalBio(request.bio(), "bio", errors);
        if (request.password() != null && !request.password().isBlank() && request.password().length() < 6) {
            errors.put("password", "A senha deve ter pelo menos 6 caracteres.");
        }
        validation.throwIfErrors(errors);

        if (dentistRepository.existsByEmailIgnoreCaseAndIdNot(email, dentist.getId())) {
            throw ApiException.conflict("email", "Já existe um profissional com este e-mail.");
        }

        dentist.setName(name);
        dentist.setEmail(email);
        dentist.setPhone(phone);
        dentist.setCro(cro);
        dentist.setSpecialty(specialty);
        dentist.setBio(bio);
        if (request.password() != null && !request.password().isBlank()) {
            dentist.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        return DentistResponse.from(dentistRepository.save(dentist));
    }

    @Transactional
    public DentistResponse updateStatus(AuthenticatedDentist principal, String dentistId, DentistStatus status) {
        requireOwner(principal);

        Dentist dentist = dentistRepository.findByIdAndClinicId(dentistId, principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Dentista não encontrado."));

        if (dentist.isOwner() && status == DentistStatus.INACTIVE) {
            throw ApiException.badRequest("O dono da clínica não pode ser desativado.");
        }

        dentist.setStatus(status);
        return DentistResponse.from(dentistRepository.save(dentist));
    }

    private void requireOwner(AuthenticatedDentist principal) {
        if (!principal.isOwner()) {
            throw ApiException.forbidden("Apenas o dono da clínica pode gerenciar a equipe.");
        }
    }

    private static String normalizeSearch(String value) {
        if (value == null || value.isBlank()) return "";
        String decomposed = Normalizer.normalize(value.trim(), Normalizer.Form.NFD);
        return decomposed.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").toLowerCase(Locale.ROOT);
    }
}
