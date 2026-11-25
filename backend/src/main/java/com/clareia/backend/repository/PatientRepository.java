package com.clareia.backend.repository;

import com.clareia.backend.domain.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, String> {
    Optional<Patient> findByIdAndClinicId(String id, String clinicId);
    List<Patient> findAllByClinicIdOrderByCreatedAtDesc(String clinicId);
    List<Patient> findAllByClinicIdAndDentistIdOrderByCreatedAtDesc(String clinicId, String dentistId);
    boolean existsByClinicIdAndEmailIgnoreCase(String clinicId, String email);
    boolean existsByClinicIdAndEmailIgnoreCaseAndIdNot(String clinicId, String email, String id);
    void deleteAllByClinicId(String clinicId);
}
