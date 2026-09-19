package com.debugmind.execution;

import com.debugmind.dto.response.VerifyFixResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ProcessSandboxServiceTest {

    @Test
    void testVerifyFixSyntaxCheck() {
        SandboxConfig config = new SandboxConfig(10, "");
        ProcessSandboxService service = new ProcessSandboxService(config);

        // Test with JavaScript code
        VerifyFixResponse response = service.verifyFix(
                "javascript",
                "valid.js",
                "function add(a, b) { return a + b; }",
                null // No tests
        );

        assertNotNull(response);
        assertTrue(response.isCompileSuccess(), "Valid JS code should pass syntax check");
        assertEquals("PARTIAL", response.getStatus(), "Without tests, status should be PARTIAL, not claimed VERIFIED");
    }

    @Test
    void testVerifyFixSyntaxErrorFails() {
        SandboxConfig config = new SandboxConfig(10, "");
        ProcessSandboxService service = new ProcessSandboxService(config);

        // Broken JavaScript code with missing parenthesis
        VerifyFixResponse response = service.verifyFix(
                "javascript",
                "broken.js",
                "function broken( { return 42; ",
                null
        );

        assertNotNull(response);
        assertFalse(response.isCompileSuccess(), "Syntax error must be caught");
        assertEquals("FAILED", response.getStatus(), "Invalid syntax must result in FAILED status");
    }
}
