package com.clareia.backend.web.controller;

import com.clareia.backend.domain.enums.DentistStatus;
import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.service.DentistService;
import com.clareia.backend.web.dto.CommandDtos;
import com.clareia.backend.web.dto.DentistResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dentists")
public class DentistController {

    private final DentistService dentistService;

    public DentistController(DentistService dentistService) {
        this.dentistService = dentistService;
    }

    @GetMapping
    public List<DentistResponse> list(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @RequestParam(required = false) DentistStatus status,
            @RequestParam(required = false) String q
    ) {
        return dentistService.listDentists(current, status, q);
    }

    @GetMapping("/{id}")
    public DentistResponse findById(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id
    ) {
        return dentistService.getDentist(current, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DentistResponse create(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @Valid @RequestBody CommandDtos.DentistRequest body
    ) {
        return dentistService.createDentist(current, body);
    }

    @PutMapping("/{id}")
    public DentistResponse update(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id,
            @Valid @RequestBody CommandDtos.DentistRequest body
    ) {
        return dentistService.updateDentist(current, id, body);
    }

    @PatchMapping("/{id}/status")
    public DentistResponse updateStatus(
            @AuthenticationPrincipal AuthenticatedDentist current,
            @PathVariable String id,
            @Valid @RequestBody CommandDtos.DentistStatusRequest body
    ) {
        return dentistService.updateStatus(current, id, body.status());
    }
}
