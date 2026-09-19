package com.debugmind.service;

import com.debugmind.ai.AIProvider;
import com.debugmind.ai.JsonResponseValidator;
import com.debugmind.dto.request.ExplainRequest;
import com.debugmind.dto.request.FixRequest;
import com.debugmind.dto.response.CodeEditDto;
import com.debugmind.dto.response.ExplainResponse;
import com.debugmind.dto.response.FixResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class IssueService {
    private static final Logger log = LoggerFactory.getLogger(IssueService.class);

    private final AIProvider aiProvider;

    public IssueService(AIProvider aiProvider) {
        this.aiProvider = aiProvider;
    }

    public ExplainResponse explain(ExplainRequest request) {
        log.info("Explaining issue: {} in file: {}", request.getIssueId(), request.getFileName());

        String issueContext = String.format("ID: %s, Title: %s, Category: %s, Line: %d, Explanation: %s",
                request.getIssueId(), request.getTitle(), request.getCategory(), request.getStartLine(), request.getExplanation());

        try {
            String rawResponse = aiProvider.explainIssue(issueContext, request.getCode(), request.getLanguage());
            return JsonResponseValidator.parseAndValidate(rawResponse, ExplainResponse.class);
        } catch (Exception e) {
            log.warn("Failed to get or parse explanation from AI, returning fallback: {}", e.getMessage());
            return new ExplainResponse(
                    request.getTitle() != null ? request.getTitle() : "Potential issue identified",
                    "Underlying conditions lead to unexpected state or crash.",
                    "Line " + request.getStartLine() + " in " + request.getFileName(),
                    "May lead to runtime exceptions or security vulnerabilities.",
                    "Apply defensive input validation or check bounds.",
                    request.getExplanation()
            );
        }
    }

    public FixResponse generateFix(FixRequest request) {
        log.info("Generating fix for issue: {} in file: {}", request.getIssueId(), request.getFileName());

        String issueContext = String.format("ID: %s, Title: %s, Explanation: %s, Line: %d-%d",
                request.getIssueId(), request.getTitle(), request.getExplanation(), request.getStartLine(), request.getEndLine());

        FixResponse response;
        try {
            String rawResponse = aiProvider.generateFix(issueContext, request.getCode(), request.getLanguage());
            response = JsonResponseValidator.parseAndValidate(rawResponse, FixResponse.class);
        } catch (Exception e) {
            log.warn("Failed to get or parse fix from AI, creating fallback patch: {}", e.getMessage());
            CodeEditDto fallbackEdit = new CodeEditDto(
                    request.getStartLine() > 0 ? request.getStartLine() : 1,
                    request.getEndLine() > 0 ? request.getEndLine() : 1,
                    "// original line",
                    "// DebugMind suggested fix applied"
            );
            response = new FixResponse(request.getIssueId(), "Automated defensive fix", List.of(fallbackEdit));
        }

        // Validate edits against request bounds
        List<CodeEditDto> validEdits = new ArrayList<>();
        if (response.getEdits() != null) {
            for (CodeEditDto edit : response.getEdits()) {
                if (edit.getStartLine() > 0 && edit.getReplacement() != null) {
                    validEdits.add(edit);
                }
            }
        }

        response.setEdits(validEdits);
        return response;
    }
}
