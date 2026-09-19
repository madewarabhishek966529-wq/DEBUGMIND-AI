package com.debugmind.dto.response;

public class IssueDto {
    private String id;
    private String severity;    // CRITICAL, HIGH, MEDIUM, LOW, INFO
    private String category;    // BUG, SECURITY, PERFORMANCE, CODE_QUALITY
    private String title;
    private String file;
    private int startLine;
    private int startColumn;
    private int endLine;
    private int endColumn;
    private String explanation;
    private Double confidence;
    private String suggestedFix;

    public IssueDto() {}

    public IssueDto(String id, String severity, String category, String title,
                    String file, int startLine, int startColumn, int endLine, int endColumn,
                    String explanation, Double confidence, String suggestedFix) {
        this.id = id;
        this.severity = severity;
        this.category = category;
        this.title = title;
        this.file = file;
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
        this.explanation = explanation;
        this.confidence = confidence;
        this.suggestedFix = suggestedFix;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFile() { return file; }
    public void setFile(String file) { this.file = file; }

    public int getStartLine() { return startLine; }
    public void setStartLine(int startLine) { this.startLine = startLine; }

    public int getStartColumn() { return startColumn; }
    public void setStartColumn(int startColumn) { this.startColumn = startColumn; }

    public int getEndLine() { return endLine; }
    public void setEndLine(int endLine) { this.endLine = endLine; }

    public int getEndColumn() { return endColumn; }
    public void setEndColumn(int endColumn) { this.endColumn = endColumn; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getSuggestedFix() { return suggestedFix; }
    public void setSuggestedFix(String suggestedFix) { this.suggestedFix = suggestedFix; }
}
