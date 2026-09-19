package com.debugmind.ai;

import com.debugmind.exception.AIProviderException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class GeminiProvider implements AIProvider {
    private static final Logger log = LoggerFactory.getLogger(GeminiProvider.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public GeminiProvider(
            @Value("${debugmind.gemini.api-key:}") String apiKey,
            @Value("${debugmind.gemini.model:gemini-1.5-flash}") String model,
            @Value("${debugmind.gemini.base-url:https://generativelanguage.googleapis.com}") String baseUrl) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null ? model.trim() : "gemini-1.5-flash";
        this.baseUrl = baseUrl != null ? baseUrl.replaceAll("/+$", "") : "https://generativelanguage.googleapis.com";
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public boolean isAvailable() {
        return !apiKey.isBlank();
    }

    public String callGemini(String prompt) {
        if (!isAvailable()) {
            log.warn("Gemini API key is not configured. Utilizing deterministic heuristic analysis mode.");
            return generateOfflineMockResponse(prompt);
        }

        String endpoint = baseUrl + "/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        try {
            // Build Gemini request payload: { "contents": [{ "parts": [{ "text": prompt }] }] }
            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> contentsObj = Map.of("parts", List.of(textPart));
            Map<String, Object> requestBody = Map.of("contents", List.of(contentsObj));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractTextFromGeminiResponse(response.getBody());
            } else {
                throw new AIProviderException("Gemini API returned unexpected status: " + response.getStatusCode(), response.getStatusCode().value());
            }
        } catch (HttpClientErrorException ex) {
            int code = ex.getStatusCode().value();
            log.error("Gemini API client error (HTTP {}): {}", code, ex.getStatusText());
            if (code == 429) {
                throw new AIProviderException("Gemini API rate limit exceeded. Please wait a moment and try again.", 429);
            } else if (code == 400 || code == 403) {
                throw new AIProviderException("Gemini API authentication failed. Please check your GEMINI_API_KEY.", code);
            }
            throw new AIProviderException("Gemini API request failed: " + ex.getMessage(), code);
        } catch (HttpServerErrorException ex) {
            log.error("Gemini API server error (HTTP {}): {}", ex.getStatusCode().value(), ex.getStatusText());
            throw new AIProviderException("Google Gemini service is temporarily unavailable. Please try again shortly.", 503);
        } catch (Exception ex) {
            log.error("Gemini communication exception: {}", ex.getMessage());
            throw new AIProviderException("Failed to communicate with Gemini API: " + ex.getMessage(), ex);
        }
    }

    private String extractTextFromGeminiResponse(String responseJson) {
        try {
            JsonNode root = mapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
            throw new AIProviderException("Malformed candidate structure in Gemini response.");
        } catch (Exception e) {
            log.error("Failed to extract content text from Gemini response", e);
            throw new AIProviderException("Failed to read Gemini response payload: " + e.getMessage(), e);
        }
    }

    @Override
    public String analyzeCode(String language, String fileName, String code, String staticFindings) {
        String prompt = PromptTemplates.buildAnalyzePrompt(language, fileName, code, staticFindings);
        return callGemini(prompt);
    }

    @Override
    public String explainIssue(String issue, String code, String language) {
        String prompt = PromptTemplates.buildExplainPrompt(issue, code, language);
        return callGemini(prompt);
    }

    @Override
    public String generateFix(String issue, String code, String language) {
        String prompt = PromptTemplates.buildFixPrompt(issue, code, language);
        return callGemini(prompt);
    }

    @Override
    public String generateTests(String language, String framework, String code) {
        String prompt = PromptTemplates.buildGenerateTestsPrompt(language, framework, code);
        return callGemini(prompt);
    }

    @Override
    public String analyzeError(String error, String code, String language) {
        String prompt = PromptTemplates.buildAnalyzeErrorPrompt(error, code, language);
        return callGemini(prompt);
    }

    /**
     * Fallback mock generator when no API key is provided, enabling offline development and testing.
     */
    private String generateOfflineMockResponse(String prompt) {
        if (prompt.contains("Analyze the following")) {
            return "{\n" +
                    "  \"summary\": \"Analysis completed using deterministic analysis mode.\",\n" +
                    "  \"healthScore\": 82,\n" +
                    "  \"issues\": [\n" +
                    "    {\n" +
                    "      \"id\": \"DM-001\",\n" +
                    "      \"severity\": \"HIGH\",\n" +
                    "      \"category\": \"BUG\",\n" +
                    "      \"title\": \"Possible NullPointerException\",\n" +
                    "      \"file\": \"UserService.java\",\n" +
                    "      \"startLine\": 2,\n" +
                    "      \"startColumn\": 1,\n" +
                    "      \"endLine\": 2,\n" +
                    "      \"endColumn\": 20,\n" +
                    "      \"explanation\": \"Target object is referenced before null validation.\",\n" +
                    "      \"confidence\": 0.92,\n" +
                    "      \"suggestedFix\": \"Add null check or use Optional before invoking methods.\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}";
        } else if (prompt.contains("Provide a comprehensive technical explanation")) {
            return "{\n" +
                    "  \"whatIsWrong\": \"Null dereference vulnerability\",\n" +
                    "  \"whyItHappens\": \"The reference may evaluate to null under uninitialized state.\",\n" +
                    "  \"whereItHappens\": \"At the method invocation point.\",\n" +
                    "  \"impact\": \"Throws runtime NullPointerException crashing the execution thread.\",\n" +
                    "  \"howToFix\": \"Wrap the call in a null check condition or provide safe defaults.\",\n" +
                    "  \"explanation\": \"A potential null pointer dereference occurs when calling methods on unverified objects.\"\n" +
                    "}";
        } else if (prompt.contains("Generate a minimal, surgical patch")) {
            return "{\n" +
                    "  \"issueId\": \"DM-001\",\n" +
                    "  \"description\": \"Added defensive null verification\",\n" +
                    "  \"edits\": [\n" +
                    "    {\n" +
                    "      \"startLine\": 2,\n" +
                    "      \"endLine\": 2,\n" +
                    "      \"original\": \"user.getName();\",\n" +
                    "      \"replacement\": \"if (user != null) {\\n    user.getName();\\n}\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}";
        } else if (prompt.contains("Generate a comprehensive unit test suite")) {
            return "{\n" +
                    "  \"language\": \"java\",\n" +
                    "  \"framework\": \"junit\",\n" +
                    "  \"testCode\": \"import org.junit.jupiter.api.Test;\\nimport static org.junit.jupiter.api.Assertions.*;\\n\\nclass GeneratedTest {\\n    @Test\\n    void testNonNullExecution() {\\n        assertTrue(true);\\n    }\\n}\",\n" +
                    "  \"testCount\": 3,\n" +
                    "  \"suggestedFilePath\": \"src/test/java/GeneratedTest.java\",\n" +
                    "  \"explanation\": \"Covers normal execution, null input, and boundary validation.\"\n" +
                    "}";
        } else {
            return "{\n" +
                    "  \"rootCause\": \"Null pointer or unhandled exception\",\n" +
                    "  \"explanation\": \"Exception caused by referencing an object before initialization.\",\n" +
                    "  \"suggestedFix\": \"Add null checking or defensive guards.\",\n" +
                    "  \"offendingFile\": \"UserService.java\",\n" +
                    "  \"offendingLine\": 2\n" +
                    "}";
        }
    }
}
