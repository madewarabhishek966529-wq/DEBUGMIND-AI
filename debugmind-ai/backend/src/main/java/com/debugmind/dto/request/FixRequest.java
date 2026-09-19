package com.debugmind.dto.request;

import jakarta.validation.constraints.NotBlank;

public class FixRequest {
    @NotBlank(message = "Issue ID is required")
    private String issueId;

    private String title;
    private String category;
    private String explanation;
    private int startLine;
    private int endLine;
    private String language;
    private String fileName;

    @NotBlank(message = "Code is required")
    private String code;

    public FixRequest() {}

    public String getIssueId() { return issueId; }
    public void setIssueId(String issueId) { this.issueId = issueId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public int getStartLine() { return startLine; }
    public void setStartLine(int startLine) { this.startLine = startLine; }

    public int getEndLine() { return endLine; }
    public void setEndLine(int endLine) { this.endLine = endLine; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
