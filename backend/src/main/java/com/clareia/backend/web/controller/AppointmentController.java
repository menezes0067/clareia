package com.clareia.backend.web.controller;

import com.clareia.backend.domain.enums.AppointmentStatus;
import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.service.AppointmentService;
import com.clareia.backend.web.dto.AppointmentResponse;
import com.clareia.backend.web.dto.CommandDtos;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<AppointmentResponse> list(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String dentistId,
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) AppointmentStatus status
    ) {
        return appointmentService.listAppointments(current, from, to, dentistId, patientId, status);
    }

    @GetMapping("/{id}")
    public AppointmentResponse findById(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id
    ) {
        return appointmentService.getAppointment(current, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @Valid @RequestBody CommandDtos.AppointmentRequest body
    ) {
        return appointmentService.createAppointment(current, body);
    }

    @PutMapping("/{id}")
    public AppointmentResponse update(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id,
            @Valid @RequestBody CommandDtos.AppointmentRequest body
    ) {
        return appointmentService.updateAppointment(current, id, body);
    }

    @PatchMapping("/{id}/status")
    public AppointmentResponse updateStatus(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id,
            @Valid @RequestBody CommandDtos.AppointmentStatusRequest body
    ) {
        return appointmentService.updateStatus(current, id, body.status());
    }
}
