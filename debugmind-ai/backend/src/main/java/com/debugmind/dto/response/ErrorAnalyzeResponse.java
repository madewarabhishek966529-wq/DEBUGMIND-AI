package com.debugmind.dto.response;

public class ErrorAnalyzeResponse {
    private String rootCause;
    private String explanation;
    private String suggestedFix;
    private String offendingFile;
    private Integer offendingLine;

    public ErrorAnalyzeResponse() {}

    public ErrorAnalyzeResponse(String rootCause, String explanation, String suggestedFix,
                                String offendingFile, Integer offendingLine) {
        this.rootCause = rootCause;
        this.explanation = explanation;
        this.suggestedFix = suggestedFix;
        this.offendingFile = offendingFile;
        this.offendingLine = offendingLine;
    }

    public String getRootCause() { return rootCause; }
    public void setRootCause(String rootCause) { this.rootCause = rootCause; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getSuggestedFix() { return suggestedFix; }
    public void setSuggestedFix(String suggestedFix) { this.suggestedFix = suggestedFix; }

    public String getOffendingFile() { return offendingFile; }
    public void setOffendingFile(String offendingFile) { this.offendingFile = offendingFile; }

    public Integer getOffendingLine() { return offendingLine; }
    public void setOffendingLine(Integer offendingLine) { this.offendingLine = offendingLine; }
}
