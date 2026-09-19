package com.debugmind.analyzer;

import com.debugmind.dto.response.IssueDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class Deduplicator {

    /**
     * Deduplicates issues between static findings and AI findings.
     * Deterministic static findings take strict precedence.
     */
    public List<IssueDto> deduplicate(List<IssueDto> staticIssues, List<IssueDto> aiIssues) {
        List<IssueDto> result = new ArrayList<>();
        Set<String> coveredLines = new HashSet<>();

        // 1. Add static issues first (higher priority)
        if (staticIssues != null) {
            for (IssueDto staticIssue : staticIssues) {
                result.add(staticIssue);
                coveredLines.add(staticIssue.getStartLine() + ":" + (staticIssue.getCategory() != null ? staticIssue.getCategory() : ""));
            }
        }

        // 2. Add AI issues only if they don't duplicate a confirmed deterministic finding on the same line & category
        if (aiIssues != null) {
            int aiIdx = 1;
            for (IssueDto aiIssue : aiIssues) {
                String key = aiIssue.getStartLine() + ":" + (aiIssue.getCategory() != null ? aiIssue.getCategory() : "");
                if (!coveredLines.contains(key)) {
                    if (aiIssue.getId() == null || aiIssue.getId().isBlank()) {
                        aiIssue.setId("DM-" + String.format("%03d", aiIdx++));
                    }
                    result.add(aiIssue);
                    coveredLines.add(key);
                }
            }
        }

        return result;
    }
}
