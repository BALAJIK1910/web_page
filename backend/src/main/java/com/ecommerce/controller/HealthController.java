package com.ecommerce.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Lightweight health check endpoint.
 * Responds immediately with HTTP 200 without querying the database,
 * perfect for pinging from the frontend to wake up sleeping free-tier servers.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        ));
    }
}

