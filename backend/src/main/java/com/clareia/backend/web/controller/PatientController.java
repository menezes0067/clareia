package com.clareia.backend.web.controller;

import com.clareia.backend.domain.enums.PatientStatus;
import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.service.PatientService;
import com.clareia.backend.web.dto.CommandDtos;
import com.clareia.backend.web.dto.PatientResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<PatientResponse> list(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @RequestParam(required = false) PatientStatus status,
            @RequestParam(required = false) String dentistId,
            @RequestParam(required = false) String q
    ) {
        return patientService.listPatients(current, status, dentistId, q);
    }

    @GetMapping("/{id}")
    public PatientResponse findById(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id
    ) {
        return patientService.getPatient(current, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponse create(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @Valid @RequestBody CommandDtos.PatientRequest body
    ) {
        return patientService.createPatient(current, body);
    }

    @PutMapping("/{id}")
    public PatientResponse update(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id,
            @Valid @RequestBody CommandDtos.PatientRequest body
    ) {
        return patientService.updatePatient(current, id, body);
    }

    @PatchMapping("/{id}/archive")
    public PatientResponse archive(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id
    ) {
        return patientService.archivePatient(current, id);
    }

    @PatchMapping("/{id}/restore")
    public PatientResponse restore(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id
    ) {
        return patientService.restorePatient(current, id);
    }
}
