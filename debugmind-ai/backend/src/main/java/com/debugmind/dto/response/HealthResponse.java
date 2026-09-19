package com.debugmind.dto.response;

import java.time.Instant;

public class HealthResponse {
    private String status;
    private String aiProvider;
    private String model;
    private boolean sandboxAvailable;
    private String timestamp;

    public HealthResponse(String status, String aiProvider, String model, boolean sandboxAvailable) {
        this.status = status;
        this.aiProvider = aiProvider;
        this.model = model;
        this.sandboxAvailable = sandboxAvailable;
        this.timestamp = Instant.now().toString();
    }

    public String getStatus() { return status; }
    public String getAiProvider() { return aiProvider; }
    public String getModel() { return model; }
    public boolean isSandboxAvailable() { return sandboxAvailable; }
    public String getTimestamp() { return timestamp; }
}
