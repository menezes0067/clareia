package com.clareia.backend.web.controller;

import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.service.ClinicService;
import com.clareia.backend.web.dto.ClinicResponse;
import com.clareia.backend.web.dto.CommandDtos;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clinic")
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    @GetMapping
    public ClinicResponse current(@AuthenticationPrincipal AuthenticatedDentist current) {
        return clinicService.getClinic(current);
    }

    @PutMapping
    public ClinicResponse update(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @Valid @RequestBody CommandDtos.ClinicRequest body
    ) {
        return clinicService.updateClinic(current, body);
    }
}
