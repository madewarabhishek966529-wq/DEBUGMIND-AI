package com.debugmind.analyzer;

import com.debugmind.dto.response.IssueDto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CodeHealthCalculator {

    /**
     * Computes an explainable code health score from 0 to 100.
     * Starts at 100 and applies weighted deductions based on verified severity.
     */
    public int calculateScore(List<IssueDto> issues) {
        if (issues == null || issues.isEmpty()) {
            return 100;
        }

        int score = 100;

        for (IssueDto issue : issues) {
            String sev = issue.getSeverity() != null ? issue.getSeverity().toUpperCase() : "MEDIUM";
            switch (sev) {
                case "CRITICAL":
                    score -= 25;
                    break;
                case "HIGH":
                    score -= 15;
                    break;
                case "MEDIUM":
                    score -= 8;
                    break;
                case "LOW":
                    score -= 3;
                    break;
                case "INFO":
                    score -= 1;
                    break;
                default:
                    score -= 5;
            }
        }

        return Math.max(0, Math.min(100, score));
    }
}
