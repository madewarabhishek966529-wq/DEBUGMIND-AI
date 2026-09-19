package com.debugmind.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JsonResponseValidator {
    private static final Logger log = LoggerFactory.getLogger(JsonResponseValidator.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String extractAndCleanJson(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "{}";
        }

        String cleaned = rawText.trim();

        // Strip ```json ... ``` or ``` ... ``` code fences
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }

        cleaned = cleaned.trim();

        // Extract substring between first '{' and last '}'
        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }

        return cleaned;
    }

    public static boolean isValidJson(String json) {
        try {
            JsonNode node = mapper.readTree(json);
            return node != null && (node.isObject() || node.isArray());
        } catch (Exception e) {
            log.warn("Invalid JSON detected: {}", e.getMessage());
            return false;
        }
    }

    public static <T> T parseAndValidate(String rawText, Class<T> clazz) {
        String cleanJson = extractAndCleanJson(rawText);
        try {
            return mapper.readValue(cleanJson, clazz);
        } catch (Exception e) {
            log.error("Failed to parse JSON into {}: {}", clazz.getSimpleName(), e.getMessage());
            throw new RuntimeException("Malformed JSON received from AI provider: " + e.getMessage(), e);
        }
    }
}
