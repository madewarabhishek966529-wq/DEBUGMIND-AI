package com.debugmind.dto.response;

import java.util.ArrayList;
import java.util.List;

public class AnalyzeResponse {
    private String summary;
    private int healthScore;
    private List<IssueDto> issues = new ArrayList<>();

    public AnalyzeResponse() {}

    public AnalyzeResponse(String summary, int healthScore, List<IssueDto> issues) {
        this.summary = summary;
        this.healthScore = healthScore;
        this.issues = issues != null ? issues : new ArrayList<>();
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public int getHealthScore() { return healthScore; }
    public void setHealthScore(int healthScore) { this.healthScore = healthScore; }

    public List<IssueDto> getIssues() { return issues; }
    public void setIssues(List<IssueDto> issues) {
        this.issues = issues != null ? issues : new ArrayList<>();
    }
}
