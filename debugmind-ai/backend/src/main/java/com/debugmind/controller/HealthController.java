package com.debugmind.controller;

import com.debugmind.ai.AIProvider;
import com.debugmind.dto.response.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final AIProvider aiProvider;
    private final String geminiModel;

    public HealthController(
            AIProvider aiProvider,
            @Value("${debugmind.gemini.model:gemini-1.5-flash}") String geminiModel) {
        this.aiProvider = aiProvider;
        this.geminiModel = geminiModel;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        return ResponseEntity.ok(new HealthResponse(
                "UP",
                aiProvider.getProviderName(),
                geminiModel,
                true // Local sandbox process runner is always available
        ));
    }
}
