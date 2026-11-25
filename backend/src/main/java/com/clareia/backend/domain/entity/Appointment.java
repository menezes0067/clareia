package com.clareia.backend.domain.entity;

import com.clareia.backend.domain.enums.AppointmentStatus;
import com.clareia.backend.domain.enums.AppointmentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "clinic_id", length = 64, nullable = false)
    private String clinicId;

    @Column(name = "dentist_id", length = 64, nullable = false)
    private String dentistId;

    @Column(name = "patient_id", length = 64, nullable = false)
    private String patientId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "start_time", length = 5, nullable = false)
    private String startTime;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(length = 24, nullable = false)
    private AppointmentType type;

    @Column(length = 16, nullable = false)
    private AppointmentStatus status;

    @Column(length = 800)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Appointment() {}

    public Appointment(
            String id,
            String clinicId,
            String dentistId,
            String patientId,
            LocalDate date,
            String startTime,
            int durationMinutes,
            AppointmentType type,
            AppointmentStatus status,
            String notes,
            Instant createdAt
    ) {
        this.id = id;
        this.clinicId = clinicId;
        this.dentistId = dentistId;
        this.patientId = patientId;
        this.date = date;
        this.startTime = startTime;
        this.durationMinutes = durationMinutes;
        this.type = type;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getClinicId() { return clinicId; }
    public String getDentistId() { return dentistId; }
    public void setDentistId(String dentistId) { this.dentistId = dentistId; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    public AppointmentType getType() { return type; }
    public void setType(AppointmentType type) { this.type = type; }
    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
}
