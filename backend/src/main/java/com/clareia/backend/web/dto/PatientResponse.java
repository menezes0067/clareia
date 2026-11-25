package com.clareia.backend.web.dto;

import com.clareia.backend.domain.entity.Patient;
import com.clareia.backend.domain.enums.PatientStatus;

public record PatientResponse(
        String id,
        String clinicId,
        String dentistId,
        String name,
        String email,
        String phone,
        String birthDate,
        String notes,
        PatientStatus status,
        String createdAt
) {
    public static PatientResponse from(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getClinicId(),
                patient.getDentistId(),
                patient.getName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getBirthDate().toString(),
                patient.getNotes() == null ? "" : patient.getNotes(),
                patient.getStatus(),
                patient.getCreatedAt().toString()
        );
    }
}
