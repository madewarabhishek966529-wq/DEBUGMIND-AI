package com.debugmind.service;

import com.debugmind.ai.AIProvider;
import com.debugmind.ai.JsonResponseValidator;
import com.debugmind.analyzer.CodeHealthCalculator;
import com.debugmind.analyzer.Deduplicator;
import com.debugmind.analyzer.FindingNormalizer;
import com.debugmind.dto.request.AnalyzeRequest;
import com.debugmind.dto.response.AnalyzeResponse;
import com.debugmind.dto.response.IssueDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class AnalysisService {
    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);

    private final AIProvider aiProvider;
    private final FindingNormalizer findingNormalizer;
    private final Deduplicator deduplicator;
    private final CodeHealthCalculator healthCalculator;

    // In-memory analysis history for local MVP
    private final List<AnalyzeResponse> analysisHistory = new CopyOnWriteArrayList<>();

    public AnalysisService(
            AIProvider aiProvider,
            FindingNormalizer findingNormalizer,
            Deduplicator deduplicator,
            CodeHealthCalculator healthCalculator) {
        this.aiProvider = aiProvider;
        this.findingNormalizer = findingNormalizer;
        this.deduplicator = deduplicator;
        this.healthCalculator = healthCalculator;
    }

    public AnalyzeResponse analyze(AnalyzeRequest request) {
        log.info("Starting analysis for file: {}, language: {}", request.getFileName(), request.getLanguage());

        // 1. Normalize static findings
        List<IssueDto> staticIssues = findingNormalizer.normalizeStaticFindings(
                request.getStaticFindings(),
                request.getFileName()
        );

        // 2. Query Gemini via AIProvider
        List<IssueDto> aiIssues = new ArrayList<>();
        String summary = "Static analysis completed.";

        try {
            String staticJson = request.getStaticFindings() != null ? request.getStaticFindings().toString() : "";
            String rawAiResponse = aiProvider.analyzeCode(
                    request.getLanguage(),
                    request.getFileName(),
                    request.getCode(),
                    staticJson
            );

            AnalyzeResponse aiResult = JsonResponseValidator.parseAndValidate(rawAiResponse, AnalyzeResponse.class);
            if (aiResult != null && aiResult.getIssues() != null) {
                aiIssues = aiResult.getIssues();
                if (aiResult.getSummary() != null && !aiResult.getSummary().isBlank()) {
                    summary = aiResult.getSummary();
                }
            }
        } catch (Exception e) {
            log.warn("AI analysis had exception or malformed JSON, falling back gracefully: {}", e.getMessage());
            summary = "Static analysis findings processed. AI analysis was unavailable or timed out.";
        }

        // 3. Deduplicate (Static findings take priority over AI suggestions)
        List<IssueDto> combinedIssues = deduplicator.deduplicate(staticIssues, aiIssues);

        // Adjust line offsets if analyzed code was a snippet
        if (request.getLineOffset() > 0) {
            for (IssueDto issue : combinedIssues) {
                issue.setStartLine(issue.getStartLine() + request.getLineOffset());
                issue.setEndLine(issue.getEndLine() + request.getLineOffset());
            }
        }

        // 4. Calculate explainable Code Health Score
        int healthScore = healthCalculator.calculateScore(combinedIssues);

        AnalyzeResponse response = new AnalyzeResponse(summary, healthScore, combinedIssues);

        // Record to history
        analysisHistory.add(0, response);
        if (analysisHistory.size() > 50) {
            analysisHistory.remove(analysisHistory.size() - 1);
        }

        return response;
    }

    public List<AnalyzeResponse> getRecentAnalyses() {
        return Collections.unmodifiableList(analysisHistory);
    }
}
