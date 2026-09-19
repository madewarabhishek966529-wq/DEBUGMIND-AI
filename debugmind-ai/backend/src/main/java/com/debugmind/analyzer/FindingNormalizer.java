package com.debugmind.analyzer;

import com.debugmind.dto.request.StaticFindingDto;
import com.debugmind.dto.response.IssueDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FindingNormalizer {

    public List<IssueDto> normalizeStaticFindings(List<StaticFindingDto> findings, String fileName) {
        List<IssueDto> normalized = new ArrayList<>();
        if (findings == null) return normalized;

        int index = 1;
        for (StaticFindingDto sf : findings) {
            String id = "STA-" + String.format("%03d", index++);
            String cat = determineCategory(sf.getCode(), sf.getMessage());

            IssueDto issue = new IssueDto(
                    id,
                    sf.getSeverity() != null ? sf.getSeverity() : "HIGH",
                    cat,
                    sf.getMessage(),
                    fileName,
                    sf.getStartLine(),
                    sf.getStartColumn(),
                    sf.getEndLine(),
                    sf.getEndColumn(),
                    "Detected by deterministic analyzer: " + sf.getSource(),
                    1.0, // Static deterministic findings have 1.0 confidence
                    "Review highlighted line and follow standard linting/security guideline."
            );
            normalized.add(issue);
        }

        return normalized;
    }

    private String determineCategory(String code, String message) {
        String lower = (code + " " + message).toLowerCase();
        if (lower.contains("sec-") || lower.contains("injection") || lower.contains("secret") || lower.contains("vuln")) {
            return "SECURITY";
        }
        if (lower.contains("perf") || lower.contains("leak") || lower.contains("loop")) {
            return "PERFORMANCE";
        }
        if (lower.contains("style") || lower.contains("empty") || lower.contains("naming") || lower.contains("unused")) {
            return "CODE_QUALITY";
        }
        return "BUG";
    }
}
