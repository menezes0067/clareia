package com.clareia.backend.domain.entity;

import com.clareia.backend.domain.enums.DentistRole;
import com.clareia.backend.domain.enums.DentistStatus;
import com.clareia.backend.domain.enums.DentistTone;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "dentists")
public class Dentist {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "clinic_id", length = 64, nullable = false)
    private String clinicId;

    @Column(length = 80, nullable = false)
    private String name;

    @Column(length = 160, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", length = 120, nullable = false)
    private String passwordHash;

    @Column(length = 20, nullable = false)
    private String phone;

    @Column(length = 24, nullable = false)
    private String cro;

    @Column(length = 120, nullable = false)
    private String specialty;

    @Column(length = 16, nullable = false)
    private DentistRole role;

    @Column(length = 16, nullable = false)
    private DentistStatus status;

    @Column(length = 16, nullable = false)
    private DentistTone tone;

    @Column(length = 400)
    private String bio;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Dentist() {}

    public Dentist(
            String id,
            String clinicId,
            String name,
            String email,
            String passwordHash,
            String phone,
            String cro,
            String specialty,
            DentistRole role,
            DentistStatus status,
            DentistTone tone,
            String bio,
            Instant createdAt
    ) {
        this.id = id;
        this.clinicId = clinicId;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.cro = cro;
        this.specialty = specialty;
        this.role = role;
        this.status = status;
        this.tone = tone;
        this.bio = bio;
        this.createdAt = createdAt;
    }

    public boolean isOwner() { return role == DentistRole.OWNER; }
    public boolean isActive() { return status == DentistStatus.ACTIVE; }

    public String getId() { return id; }
    public String getClinicId() { return clinicId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCro() { return cro; }
    public void setCro(String cro) { this.cro = cro; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public DentistRole getRole() { return role; }
    public DentistStatus getStatus() { return status; }
    public void setStatus(DentistStatus status) { this.status = status; }
    public DentistTone getTone() { return tone; }
    public void setTone(DentistTone tone) { this.tone = tone; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Instant getCreatedAt() { return createdAt; }
}
