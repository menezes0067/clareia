package com.clareia.backend.repository;

import com.clareia.backend.domain.entity.Dentist;
import com.clareia.backend.domain.enums.DentistStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DentistRepository extends JpaRepository<Dentist, String> {
    Optional<Dentist> findByEmailIgnoreCase(String email);
    Optional<Dentist> findByIdAndClinicId(String id, String clinicId);
    List<Dentist> findAllByClinicIdOrderByCreatedAtAsc(String clinicId);
    List<Dentist> findAllByClinicIdAndStatusOrderByCreatedAtAsc(String clinicId, DentistStatus status);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, String id);
    int countByClinicId(String clinicId);
    void deleteAllByClinicId(String clinicId);
}
