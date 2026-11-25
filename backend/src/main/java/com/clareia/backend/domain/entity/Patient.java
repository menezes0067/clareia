package com.clareia.backend.domain.entity;

import com.clareia.backend.domain.enums.PatientStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "clinic_id", length = 64, nullable = false)
    private String clinicId;

    @Column(name = "dentist_id", length = 64, nullable = false)
    private String dentistId;

    @Column(length = 80, nullable = false)
    private String name;

    @Column(length = 160, nullable = false)
    private String email;

    @Column(length = 20, nullable = false)
    private String phone;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(length = 1200, nullable = false)
    private String notes;

    @Column(length = 16, nullable = false)
    private PatientStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Patient() {}

    public Patient(
            String id,
            String clinicId,
            String dentistId,
            String name,
            String email,
            String phone,
            LocalDate birthDate,
            String notes,
            PatientStatus status,
            Instant createdAt
    ) {
        this.id = id;
        this.clinicId = clinicId;
        this.dentistId = dentistId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.birthDate = birthDate;
        this.notes = notes == null ? "" : notes;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getClinicId() { return clinicId; }
    public String getDentistId() { return dentistId; }
    public void setDentistId(String dentistId) { this.dentistId = dentistId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes == null ? "" : notes; }
    public PatientStatus getStatus() { return status; }
    public void setStatus(PatientStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
