package com.debugmind.service;

import com.debugmind.ai.AIProvider;
import com.debugmind.ai.JsonResponseValidator;
import com.debugmind.dto.request.GenerateTestRequest;
import com.debugmind.dto.response.GenerateTestResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TestGenerationService {
    private static final Logger log = LoggerFactory.getLogger(TestGenerationService.class);

    private final AIProvider aiProvider;

    public TestGenerationService(AIProvider aiProvider) {
        this.aiProvider = aiProvider;
    }

    public GenerateTestResponse generateTests(GenerateTestRequest request) {
        log.info("Generating {} tests for file: {}", request.getFramework(), request.getFileName());

        String framework = request.getFramework() != null && !request.getFramework().isBlank()
                ? request.getFramework()
                : "default unit testing framework";

        String rawResponse = aiProvider.generateTests(request.getLanguage(), framework, request.getCode());

        try {
            return JsonResponseValidator.parseAndValidate(rawResponse, GenerateTestResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse test generation response as JSON, wrapping directly: {}", e.getMessage());
            String cleanText = JsonResponseValidator.extractAndCleanJson(rawResponse);
            return new GenerateTestResponse(
                    request.getLanguage(),
                    framework,
                    cleanText,
                    1,
                    "test_" + request.getFileName(),
                    "Generated unit tests."
            );
        }
    }
}
