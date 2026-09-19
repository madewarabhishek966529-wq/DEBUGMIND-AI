package com.debugmind.execution;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SandboxConfig {
    private final int timeoutSeconds;
    private final String customTempDir;

    public SandboxConfig(
            @Value("${debugmind.sandbox.timeout-seconds:15}") int timeoutSeconds,
            @Value("${debugmind.sandbox.temp-dir:}") String customTempDir) {
        this.timeoutSeconds = timeoutSeconds > 0 ? timeoutSeconds : 15;
        this.customTempDir = customTempDir != null ? customTempDir.trim() : "";
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public String getCustomTempDir() {
        return customTempDir;
    }
}
