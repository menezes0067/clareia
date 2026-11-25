package com.clareia.backend.web.dto;

import com.clareia.backend.domain.entity.Clinic;

public record ClinicResponse(
        String id,
        String name,
        String address,
        String cnpj,
        String phone,
        String email,
        String ownerDentistId,
        String createdAt
) {
    public static ClinicResponse from(Clinic clinic) {
        return new ClinicResponse(
                clinic.getId(),
                clinic.getName(),
                clinic.getAddress(),
                clinic.getCnpj(),
                clinic.getPhone(),
                clinic.getEmail(),
                clinic.getOwnerDentistId(),
                clinic.getCreatedAt().toString()
        );
    }
}
