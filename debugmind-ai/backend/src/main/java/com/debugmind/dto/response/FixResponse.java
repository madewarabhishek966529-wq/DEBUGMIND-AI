package com.debugmind.dto.response;

import java.util.ArrayList;
import java.util.List;

public class FixResponse {
    private String issueId;
    private String description;
    private List<CodeEditDto> edits = new ArrayList<>();

    public FixResponse() {}

    public FixResponse(String issueId, String description, List<CodeEditDto> edits) {
        this.issueId = issueId;
        this.description = description;
        this.edits = edits != null ? edits : new ArrayList<>();
    }

    public String getIssueId() { return issueId; }
    public void setIssueId(String issueId) { this.issueId = issueId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<CodeEditDto> getEdits() { return edits; }
    public void setEdits(List<CodeEditDto> edits) {
        this.edits = edits != null ? edits : new ArrayList<>();
    }
}
