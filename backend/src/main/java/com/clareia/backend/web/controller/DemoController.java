package com.clareia.backend.web.controller;

import com.clareia.backend.service.DemoSeedService;
import com.clareia.backend.web.dto.AuthDtos;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/demo")
public class DemoController {

    private final DemoSeedService demoSeedService;

    public DemoController(DemoSeedService demoSeedService) {
        this.demoSeedService = demoSeedService;
    }

    @GetMapping("/accounts")
    public List<AuthDtos.DemoAccountResponse> accounts() {
        return demoSeedService.listDemoAccounts();
    }

    @PostMapping("/reset")
    public AuthDtos.AuthResponse reset() {
        return demoSeedService.resetDemo();
    }
}
