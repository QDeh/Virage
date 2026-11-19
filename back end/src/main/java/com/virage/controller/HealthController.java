package com.virage.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    @Operation(summary = "Vérifier l’état de l’API")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
