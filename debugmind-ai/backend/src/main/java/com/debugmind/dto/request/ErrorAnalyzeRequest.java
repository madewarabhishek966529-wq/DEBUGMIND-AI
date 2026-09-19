package com.debugmind.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ErrorAnalyzeRequest {
    @NotBlank(message = "Error message or stack trace is required")
    private String error;

    private String code;
    private String language;
    private String detectedFile;
    private Integer detectedLine;

    public ErrorAnalyzeRequest() {}

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getDetectedFile() { return detectedFile; }
    public void setDetectedFile(String detectedFile) { this.detectedFile = detectedFile; }

    public Integer getDetectedLine() { return detectedLine; }
    public void setDetectedLine(Integer detectedLine) { this.detectedLine = detectedLine; }
}
