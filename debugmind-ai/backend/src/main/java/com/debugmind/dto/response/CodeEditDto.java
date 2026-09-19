package com.debugmind.dto.response;

public class CodeEditDto {
    private int startLine;
    private int endLine;
    private String original;
    private String replacement;

    public CodeEditDto() {}

    public CodeEditDto(int startLine, int endLine, String original, String replacement) {
        this.startLine = startLine;
        this.endLine = endLine;
        this.original = original;
        this.replacement = replacement;
    }

    public int getStartLine() { return startLine; }
    public void setStartLine(int startLine) { this.startLine = startLine; }

    public int getEndLine() { return endLine; }
    public void setEndLine(int endLine) { this.endLine = endLine; }

    public String getOriginal() { return original; }
    public void setOriginal(String original) { this.original = original; }

    public String getReplacement() { return replacement; }
    public void setReplacement(String replacement) { this.replacement = replacement; }
}
