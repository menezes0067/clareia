package com.clareia.backend.web.dto;

import com.clareia.backend.domain.entity.Appointment;
import com.clareia.backend.domain.enums.AppointmentStatus;
import com.clareia.backend.domain.enums.AppointmentType;

public record AppointmentResponse(
        String id,
        String clinicId,
        String dentistId,
        String patientId,
        String date,
        String startTime,
        int durationMinutes,
        AppointmentType type,
        AppointmentStatus status,
        String notes,
        String createdAt
) {
    public static AppointmentResponse from(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getClinicId(),
                appointment.getDentistId(),
                appointment.getPatientId(),
                appointment.getDate().toString(),
                appointment.getStartTime(),
                appointment.getDurationMinutes(),
                appointment.getType(),
                appointment.getStatus(),
                appointment.getNotes(),
                appointment.getCreatedAt().toString()
        );
    }
}
