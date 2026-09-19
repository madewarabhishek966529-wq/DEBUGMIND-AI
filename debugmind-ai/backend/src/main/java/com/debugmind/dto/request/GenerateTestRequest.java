package com.debugmind.dto.request;

import jakarta.validation.constraints.NotBlank;

public class GenerateTestRequest {
    @NotBlank(message = "Language is required")
    private String language;

    private String framework;
    private String fileName;

    @NotBlank(message = "Source code is required")
    private String code;

    public GenerateTestRequest() {}

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getFramework() { return framework; }
    public void setFramework(String framework) { this.framework = framework; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
