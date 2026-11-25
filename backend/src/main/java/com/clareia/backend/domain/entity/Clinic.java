package com.clareia.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "clinics")
public class Clinic {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(length = 80, nullable = false)
    private String name;

    @Column(length = 255, nullable = false)
    private String address;

    @Column(length = 18, nullable = false, unique = true)
    private String cnpj;

    @Column(length = 20, nullable = false)
    private String phone;

    @Column(length = 160, nullable = false)
    private String email;

    @Column(name = "owner_dentist_id", length = 64, nullable = false, unique = true)
    private String ownerDentistId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Clinic() {}

    public Clinic(
            String id,
            String name,
            String address,
            String cnpj,
            String phone,
            String email,
            String ownerDentistId,
            Instant createdAt
    ) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.cnpj = cnpj;
        this.phone = phone;
        this.email = email;
        this.ownerDentistId = ownerDentistId;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOwnerDentistId() { return ownerDentistId; }
    public Instant getCreatedAt() { return createdAt; }
}
