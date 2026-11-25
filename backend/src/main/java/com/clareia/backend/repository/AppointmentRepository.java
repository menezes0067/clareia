package com.clareia.backend.repository;

import com.clareia.backend.domain.entity.Appointment;
import com.clareia.backend.domain.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    Optional<Appointment> findByIdAndClinicId(String id, String clinicId);
    List<Appointment> findAllByClinicIdOrderByDateAscStartTimeAsc(String clinicId);
    List<Appointment> findAllByClinicIdAndDentistIdOrderByDateAscStartTimeAsc(String clinicId, String dentistId);
    List<Appointment> findAllByClinicIdAndDentistIdAndDateAndStatusNot(
            String clinicId, String dentistId, LocalDate date, AppointmentStatus excludedStatus
    );
    List<Appointment> findAllByClinicIdAndPatientIdAndDateAndStatusNot(
            String clinicId, String patientId, LocalDate date, AppointmentStatus excludedStatus
    );
    void deleteAllByClinicId(String clinicId);
}
