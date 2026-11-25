package com.clareia.backend.repository;

import com.clareia.backend.domain.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClinicRepository extends JpaRepository<Clinic, String> {
    boolean existsByCnpj(String cnpj);
    boolean existsByCnpjAndIdNot(String cnpj, String id);
    Optional<Clinic> findByCnpj(String cnpj);
}
