package com.debugmind.ai;

public interface AIProvider {

    String analyzeCode(
            String language,
            String fileName,
            String code,
            String staticFindings
    );

    String explainIssue(
            String issue,
            String code,
            String language
    );

    String generateFix(
            String issue,
            String code,
            String language
    );

    String generateTests(
            String language,
            String framework,
            String code
    );

    String analyzeError(
            String error,
            String code,
            String language
    );

    String getProviderName();

    boolean isAvailable();
}
