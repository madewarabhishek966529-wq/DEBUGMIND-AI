package com.debugmind.service;

import com.debugmind.dto.request.VerifyFixRequest;
import com.debugmind.dto.response.VerifyFixResponse;
import com.debugmind.execution.ProcessSandboxService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class FixVerificationService {
    private static final Logger log = LoggerFactory.getLogger(FixVerificationService.class);

    private final ProcessSandboxService sandboxService;

    public FixVerificationService(ProcessSandboxService sandboxService) {
        this.sandboxService = sandboxService;
    }

    public VerifyFixResponse verify(VerifyFixRequest request) {
        log.info("Verifying fix for file: {}, language: {}, issue: {}",
                request.getFileName(), request.getLanguage(), request.getIssueId());

        return sandboxService.verifyFix(
                request.getLanguage(),
                request.getFileName(),
                request.getCode(),
                request.getTestCode()
        );
    }
}
