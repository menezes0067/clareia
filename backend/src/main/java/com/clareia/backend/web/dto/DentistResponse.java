package com.clareia.backend.web.dto;

import com.clareia.backend.domain.entity.Dentist;
import com.clareia.backend.domain.enums.DentistRole;
import com.clareia.backend.domain.enums.DentistStatus;
import com.clareia.backend.domain.enums.DentistTone;

public record DentistResponse(
        String id,
        String clinicId,
        String name,
        String email,
        String phone,
        String cro,
        String specialty,
        DentistRole role,
        DentistStatus status,
        DentistTone tone,
        String bio,
        String createdAt
) {
    public static DentistResponse from(Dentist dentist) {
        return new DentistResponse(
                dentist.getId(),
                dentist.getClinicId(),
                dentist.getName(),
                dentist.getEmail(),
                dentist.getPhone(),
                dentist.getCro(),
                dentist.getSpecialty(),
                dentist.getRole(),
                dentist.getStatus(),
                dentist.getTone(),
                dentist.getBio(),
                dentist.getCreatedAt().toString()
        );
    }
}
