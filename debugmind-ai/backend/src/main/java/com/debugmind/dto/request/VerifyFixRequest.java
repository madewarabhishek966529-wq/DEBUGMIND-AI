package com.debugmind.dto.request;

import jakarta.validation.constraints.NotBlank;

public class VerifyFixRequest {
    @NotBlank(message = "Language is required")
    private String language;

    private String fileName;

    @NotBlank(message = "Code is required")
    private String code;

    private String issueId;
    private String workspacePath;
    private String testCode;

    public VerifyFixRequest() {}

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getIssueId() { return issueId; }
    public void setIssueId(String issueId) { this.issueId = issueId; }

    public String getWorkspacePath() { return workspacePath; }
    public void setWorkspacePath(String workspacePath) { this.workspacePath = workspacePath; }

    public String getTestCode() { return testCode; }
    public void setTestCode(String testCode) { this.testCode = testCode; }
}
