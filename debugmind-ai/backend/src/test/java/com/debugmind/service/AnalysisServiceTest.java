package com.debugmind.service;

import com.debugmind.analyzer.CodeHealthCalculator;
import com.debugmind.analyzer.Deduplicator;
import com.debugmind.analyzer.FindingNormalizer;
import com.debugmind.dto.request.AnalyzeRequest;
import com.debugmind.dto.request.StaticFindingDto;
import com.debugmind.dto.response.AnalyzeResponse;
import com.debugmind.dto.response.IssueDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class AnalysisServiceTest {

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private CodeHealthCalculator healthCalculator;

    @Test
    void testCodeHealthCalculation() {
        IssueDto critIssue = new IssueDto();
        critIssue.setSeverity("CRITICAL");

        IssueDto highIssue = new IssueDto();
        highIssue.setSeverity("HIGH");

        // Starting at 100: 100 - 25 (CRITICAL) - 15 (HIGH) = 60
        int score = healthCalculator.calculateScore(List.of(critIssue, highIssue));
        assertEquals(60, score);
    }

    @Test
    void testAnalyzeWithStaticFindings() {
        AnalyzeRequest request = new AnalyzeRequest();
        request.setLanguage("javascript");
        request.setFileName("app.js");
        request.setCode("const q = 'SELECT * FROM users WHERE id=' + id;");

        StaticFindingDto staticFinding = new StaticFindingDto();
        staticFinding.setSource("ESLint/Security");
        staticFinding.setCode("SEC-SQL-CONCAT");
        staticFinding.setMessage("Potential SQL injection risk detected.");
        staticFinding.setSeverity("HIGH");
        staticFinding.setStartLine(1);
        staticFinding.setEndLine(1);

        request.setStaticFindings(List.of(staticFinding));

        AnalyzeResponse response = analysisService.analyze(request);

        assertNotNull(response);
        assertFalse(response.getIssues().isEmpty());
        assertTrue(response.getHealthScore() < 100);

        // Ensure static finding is present with 1.0 confidence
        boolean hasStatic = response.getIssues().stream()
                .anyMatch(i -> i.getConfidence() != null && i.getConfidence() >= 0.99);
        assertTrue(hasStatic, "Static findings should have high confidence");
    }
}
