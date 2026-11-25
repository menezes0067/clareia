package com.clareia.backend.service;

import com.clareia.backend.domain.entity.Clinic;
import com.clareia.backend.domain.entity.Dentist;
import com.clareia.backend.domain.enums.DentistRole;
import com.clareia.backend.domain.enums.DentistStatus;
import com.clareia.backend.domain.enums.DentistTone;
import com.clareia.backend.domain.util.Formatters;
import com.clareia.backend.domain.util.IdGenerator;
import com.clareia.backend.repository.AppointmentRepository;
import com.clareia.backend.repository.ClinicRepository;
import com.clareia.backend.repository.DentistRepository;
import com.clareia.backend.repository.PatientRepository;
import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.security.JwtService;
import com.clareia.backend.web.dto.AppointmentResponse;
import com.clareia.backend.web.dto.AuthDtos.AuthResponse;
import com.clareia.backend.web.dto.AuthDtos.LoginRequest;
import com.clareia.backend.web.dto.AuthDtos.MeResponse;
import com.clareia.backend.web.dto.AuthDtos.WorkspaceResponse;
import com.clareia.backend.web.dto.ClinicResponse;
import com.clareia.backend.web.dto.CommandDtos.RegisterClinicRequest;
import com.clareia.backend.web.dto.DentistResponse;
import com.clareia.backend.web.dto.PatientResponse;
import com.clareia.backend.web.error.ApiException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private final ClinicRepository clinicRepository;
    private final DentistRepository dentistRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DomainValidationSupport validation;
    private final Clock clock;

    public AuthService(
            ClinicRepository clinicRepository,
            DentistRepository dentistRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            DomainValidationSupport validation,
            Clock clock
    ) {
        this.clinicRepository = clinicRepository;
        this.dentistRepository = dentistRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.validation = validation;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = Formatters.normalizeEmail(request.email());
        Dentist dentist = dentistRepository.findByEmailIgnoreCase(email)
                .filter(Dentist::isActive)
                .orElseThrow(() -> ApiException.unauthorized("Não encontramos uma conta ativa com este e-mail."));

        if (!passwordEncoder.matches(request.password(), dentist.getPasswordHash())) {
            throw ApiException.unauthorized("Senha incorreta.");
        }

        Clinic clinic = clinicRepository.findById(dentist.getClinicId())
                .orElseThrow(() -> ApiException.notFound("Clínica associada não encontrada."));

        String token = jwtService.generateToken(dentist);
        return new AuthResponse(
                token,
                jwtService.getExpirationSeconds(),
                DentistResponse.from(dentist),
                ClinicResponse.from(clinic)
        );
    }

    @Transactional
    public AuthResponse registerClinic(RegisterClinicRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();

        String ownerName = validation.requireName(request.owner().name(), "owner.name", errors);
        String ownerEmail = validation.requireEmail(request.owner().email(), "owner.email", errors);
        String ownerPhone = validation.requirePhone(request.owner().phone(), "owner.phone", errors);
        String ownerCro = validation.requireCro(request.owner().cro(), "owner.cro", errors);
        String ownerSpecialty = validation.requireSpecialty(request.owner().specialty(), "owner.specialty", errors);
        String ownerBio = validation.optionalBio(request.owner().bio(), "owner.bio", errors);
        String ownerPassword = validation.resolveNewAccountPassword(request.owner().password(), "owner.password", errors);

        String clinicName = validation.requireClinicName(request.clinic().name(), "clinic.name", errors);
        String clinicAddress = validation.requireAddress(request.clinic().address(), "clinic.address", errors);
        String clinicCnpj = validation.requireCnpj(request.clinic().cnpj(), "clinic.cnpj", errors);
        String clinicPhone = validation.requirePhone(request.clinic().phone(), "clinic.phone", errors);
        String clinicEmail = validation.requireEmail(request.clinic().email(), "clinic.email", errors);

        validation.throwIfErrors(errors);

        if (dentistRepository.existsByEmailIgnoreCase(ownerEmail)) {
            throw ApiException.conflict("owner.email", "Já existe uma conta cadastrada com este e-mail.");
        }
        if (clinicRepository.existsByCnpj(clinicCnpj)) {
            throw ApiException.conflict("clinic.cnpj", "Já existe uma clínica cadastrada com este CNPJ.");
        }

        Instant now = Instant.now(clock);
        String clinicId = IdGenerator.newClinicId();
        String ownerId = IdGenerator.newOwnerDentistId();

        Clinic clinic = new Clinic(
                clinicId,
                clinicName,
                clinicAddress,
                clinicCnpj,
                clinicPhone,
                clinicEmail,
                ownerId,
                now
        );
        clinicRepository.saveAndFlush(clinic);

        Dentist owner = new Dentist(
                ownerId,
                clinicId,
                ownerName,
                ownerEmail,
                passwordEncoder.encode(ownerPassword),
                ownerPhone,
                ownerCro,
                ownerSpecialty,
                DentistRole.OWNER,
                DentistStatus.ACTIVE,
                DentistTone.TEAL,
                ownerBio,
                now
        );
        dentistRepository.saveAndFlush(owner);

        String token = jwtService.generateToken(owner);
        return new AuthResponse(
                token,
                jwtService.getExpirationSeconds(),
                DentistResponse.from(owner),
                ClinicResponse.from(clinic)
        );
    }

    @Transactional(readOnly = true)
    public MeResponse me(AuthenticatedDentist principal) {
        Dentist dentist = dentistRepository.findByIdAndClinicId(principal.id(), principal.clinicId())
                .filter(Dentist::isActive)
                .orElseThrow(() -> ApiException.unauthorized("Sessão inválida."));
        Clinic clinic = clinicRepository.findById(principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Clínica não encontrada."));
        return new MeResponse(DentistResponse.from(dentist), ClinicResponse.from(clinic));
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse workspace(AuthenticatedDentist principal) {
        Clinic clinic = clinicRepository.findById(principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Clínica não encontrada."));

        List<DentistResponse> dentists;
        List<PatientResponse> patients;
        List<AppointmentResponse> appointments;

        if (principal.isOwner()) {
            dentists = dentistRepository.findAllByClinicIdOrderByCreatedAtAsc(principal.clinicId())
                    .stream().map(DentistResponse::from).toList();
            patients = patientRepository.findAllByClinicIdOrderByCreatedAtDesc(principal.clinicId())
                    .stream().map(PatientResponse::from).toList();
            appointments = appointmentRepository.findAllByClinicIdOrderByDateAscStartTimeAsc(principal.clinicId())
                    .stream().map(AppointmentResponse::from).toList();
        } else {
            Dentist self = dentistRepository.findByIdAndClinicId(principal.id(), principal.clinicId())
                    .orElseThrow(() -> ApiException.unauthorized("Sessão inválida."));
            dentists = List.of(DentistResponse.from(self));
            patients = patientRepository.findAllByClinicIdAndDentistIdOrderByCreatedAtDesc(
                    principal.clinicId(), principal.id()
            ).stream().map(PatientResponse::from).toList();
            appointments = appointmentRepository.findAllByClinicIdAndDentistIdOrderByDateAscStartTimeAsc(
                    principal.clinicId(), principal.id()
            ).stream().map(AppointmentResponse::from).toList();
        }

        return new WorkspaceResponse(ClinicResponse.from(clinic), dentists, patients, appointments);
    }
}
