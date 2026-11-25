package com.clareia.backend.web.dto;

import com.clareia.backend.domain.entity.Dentist;
import com.clareia.backend.domain.enums.DentistRole;
import com.clareia.backend.domain.enums.DentistTone;

import java.util.List;

public final class AuthDtos {

    private AuthDtos() {}

    public record LoginRequest(
            @jakarta.validation.constraints.NotBlank(message = "Informe um e-mail válido.")
            @jakarta.validation.constraints.Email(message = "Informe um e-mail válido.")
            String email,
            @jakarta.validation.constraints.NotBlank(message = "Informe a senha.")
            String password
    ) {}

    public record AuthResponse(
            String accessToken,
            long expiresIn,
            DentistResponse dentist,
            ClinicResponse clinic
    ) {}

    public record MeResponse(
            DentistResponse dentist,
            ClinicResponse clinic
    ) {}

    public record WorkspaceResponse(
            ClinicResponse clinic,
            List<DentistResponse> dentists,
            List<PatientResponse> patients,
            List<AppointmentResponse> appointments
    ) {}

    public record DemoAccountResponse(
            String id,
            String name,
            String email,
            String specialty,
            DentistRole role,
            DentistTone tone
    ) {
        public static DemoAccountResponse from(Dentist dentist) {
            return new DemoAccountResponse(
                    dentist.getId(),
                    dentist.getName(),
                    dentist.getEmail(),
                    dentist.getSpecialty(),
                    dentist.getRole(),
                    dentist.getTone()
            );
        }
    }
}
