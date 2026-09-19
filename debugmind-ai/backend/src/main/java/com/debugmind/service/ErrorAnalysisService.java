package com.debugmind.service;

import com.debugmind.ai.AIProvider;
import com.debugmind.ai.JsonResponseValidator;
import com.debugmind.dto.request.ErrorAnalyzeRequest;
import com.debugmind.dto.response.ErrorAnalyzeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ErrorAnalysisService {
    private static final Logger log = LoggerFactory.getLogger(ErrorAnalysisService.class);

    private final AIProvider aiProvider;

    public ErrorAnalysisService(AIProvider aiProvider) {
        this.aiProvider = aiProvider;
    }

    public ErrorAnalyzeResponse analyzeError(ErrorAnalyzeRequest request) {
        log.info("Analyzing error trace for language: {}", request.getLanguage());

        String rawResponse = aiProvider.analyzeError(
                request.getError(),
                request.getCode(),
                request.getLanguage() != null ? request.getLanguage() : "general"
        );

        try {
            return JsonResponseValidator.parseAndValidate(rawResponse, ErrorAnalyzeResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse error analysis JSON, returning structured fallback: {}", e.getMessage());
            return new ErrorAnalyzeResponse(
                    "Runtime Exception or Compiler Error",
                    "An unhandled error occurred during execution.",
                    "Verify null values, check types, and ensure all prerequisites are met.",
                    request.getDetectedFile(),
                    request.getDetectedLine()
            );
        }
    }
}
