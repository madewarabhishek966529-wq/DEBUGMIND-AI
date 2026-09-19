package com.debugmind.dto.response;

public class GenerateTestResponse {
    private String language;
    private String framework;
    private String testCode;
    private int testCount;
    private String suggestedFilePath;
    private String explanation;

    public GenerateTestResponse() {}

    public GenerateTestResponse(String language, String framework, String testCode,
                                int testCount, String suggestedFilePath, String explanation) {
        this.language = language;
        this.framework = framework;
        this.testCode = testCode;
        this.testCount = testCount;
        this.suggestedFilePath = suggestedFilePath;
        this.explanation = explanation;
    }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getFramework() { return framework; }
    public void setFramework(String framework) { this.framework = framework; }

    public String getTestCode() { return testCode; }
    public void setTestCode(String testCode) { this.testCode = testCode; }

    public int getTestCount() { return testCount; }
    public void setTestCount(int testCount) { this.testCount = testCount; }

    public String getSuggestedFilePath() { return suggestedFilePath; }
    public void setSuggestedFilePath(String suggestedFilePath) { this.suggestedFilePath = suggestedFilePath; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
