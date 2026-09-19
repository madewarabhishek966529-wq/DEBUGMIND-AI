package com.debugmind.dto.request;

public class StaticFindingDto {
    private String source;
    private String code;
    private String message;
    private String severity;
    private int startLine;
    private int startColumn;
    private int endLine;
    private int endColumn;

    public StaticFindingDto() {}

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public int getStartLine() { return startLine; }
    public void setStartLine(int startLine) { this.startLine = startLine; }

    public int getStartColumn() { return startColumn; }
    public void setStartColumn(int startColumn) { this.startColumn = startColumn; }

    public int getEndLine() { return endLine; }
    public void setEndLine(int endLine) { this.endLine = endLine; }

    public int getEndColumn() { return endColumn; }
    public void setEndColumn(int endColumn) { this.endColumn = endColumn; }
}
