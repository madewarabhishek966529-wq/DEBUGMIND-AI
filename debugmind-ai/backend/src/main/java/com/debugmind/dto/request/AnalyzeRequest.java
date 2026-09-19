package com.debugmind.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class AnalyzeRequest {
    @NotBlank(message = "Language is required")
    private String language;

    private String fileName;

    @NotBlank(message = "Source code cannot be empty")
    private String code;

    private int lineOffset = 0;

    private List<StaticFindingDto> staticFindings = new ArrayList<>();

    public AnalyzeRequest() {}

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public int getLineOffset() { return lineOffset; }
    public void setLineOffset(int lineOffset) { this.lineOffset = lineOffset; }

    public List<StaticFindingDto> getStaticFindings() { return staticFindings; }
    public void setStaticFindings(List<StaticFindingDto> staticFindings) {
        this.staticFindings = staticFindings != null ? staticFindings : new ArrayList<>();
    }
}
