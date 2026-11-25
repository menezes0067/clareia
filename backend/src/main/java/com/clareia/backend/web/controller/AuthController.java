package com.clareia.backend.web.controller;

import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.service.AuthService;
import com.clareia.backend.web.dto.AuthDtos;
import com.clareia.backend.web.dto.CommandDtos;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest body) {
        return authService.login(body);
    }

    @PostMapping("/auth/register-clinic")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.AuthResponse registerClinic(@Valid @RequestBody CommandDtos.RegisterClinicRequest body) {
        return authService.registerClinic(body);
    }

    @GetMapping("/auth/me")
    public AuthDtos.MeResponse me(@AuthenticationPrincipal AuthenticatedDentist current) {
        return authService.me(current);
    }

    @GetMapping("/workspace")
    public AuthDtos.WorkspaceResponse workspace(@AuthenticationPrincipal AuthenticatedDentist current) {
        return authService.workspace(current);
    }
}
