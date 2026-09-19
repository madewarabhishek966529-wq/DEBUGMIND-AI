package com.debugmind.ai;

import com.debugmind.dto.response.AnalyzeResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GeminiProviderTest {

    @Test
    void testOfflineFallbackResponse() {
        GeminiProvider provider = new GeminiProvider("", "gemini-1.5-flash", "https://generativelanguage.googleapis.com");
        assertFalse(provider.isAvailable(), "Provider should report unavailable without API key");

        String response = provider.analyzeCode("java", "UserService.java", "user.getName();", "");
        assertNotNull(response);

        AnalyzeResponse parsed = JsonResponseValidator.parseAndValidate(response, AnalyzeResponse.class);
        assertNotNull(parsed);
        assertFalse(parsed.getIssues().isEmpty());
    }

    @Test
    void testJsonResponseValidatorCleaning() {
        String wrappedJson = "```json\n{\n  \"summary\": \"All good\",\n  \"healthScore\": 100,\n  \"issues\": []\n}\n```";
        String cleaned = JsonResponseValidator.extractAndCleanJson(wrappedJson);

        assertTrue(cleaned.startsWith("{"));
        assertTrue(cleaned.endsWith("}"));
        assertTrue(JsonResponseValidator.isValidJson(cleaned));
    }

    @Test
    void testPromptRulesEnforced() {
        String prompt = PromptTemplates.buildAnalyzePrompt("java", "Test.java", "code", "none");
        assertTrue(prompt.contains("Analyze ONLY supplied evidence"));
        assertTrue(prompt.contains("Do NOT invent files"));
        assertTrue(prompt.contains("Prefer minimal"));
    }
}
