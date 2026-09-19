package com.debugmind.ai;

public class PromptTemplates {

    public static final String SYSTEM_RULES =
            "You are DebugMind AI, an expert code analyzer and verification engine.\n" +
            "STRICT RULES:\n" +
            "1. Analyze ONLY supplied evidence. Do not assume unprovided external libraries or files exist.\n" +
            "2. Do NOT invent files, line numbers, functions, or runtime errors.\n" +
            "3. Distinguish confirmed deterministic problems from speculative/possible problems.\n" +
            "4. Return ONLY raw valid JSON matching the exact requested schema. Do not wrap in markdown or backticks unless requested.\n" +
            "5. Provide a realistic confidence score (between 0.0 and 1.0) for every detected issue.\n" +
            "6. Do NOT claim that any fix is verified. Verification occurs only after automated test execution.\n" +
            "7. Do NOT make unnecessary code changes. Preserve existing architecture and conventions.\n" +
            "8. Prefer minimal, surgical fixes over broad refactorings.\n";

    public static String buildAnalyzePrompt(String language, String fileName, String code, String staticFindings) {
        return SYSTEM_RULES + "\n" +
                "TASK: Analyze the following " + language + " file (" + fileName + ") for potential bugs, security flaws, performance bottlenecks, and code quality issues.\n" +
                "Existing static analysis findings to corroborate:\n" +
                (staticFindings != null && !staticFindings.isBlank() ? staticFindings : "None provided") + "\n\n" +
                "SOURCE CODE:\n```" + language + "\n" + code + "\n```\n\n" +
                "Return valid JSON matching this schema:\n" +
                "{\n" +
                "  \"summary\": \"Brief summary of findings\",\n" +
                "  \"healthScore\": 85,\n" +
                "  \"issues\": [\n" +
                "    {\n" +
                "      \"id\": \"DM-001\",\n" +
                "      \"severity\": \"CRITICAL|HIGH|MEDIUM|LOW|INFO\",\n" +
                "      \"category\": \"BUG|SECURITY|PERFORMANCE|CODE_QUALITY\",\n" +
                "      \"title\": \"Clear concise title\",\n" +
                "      \"file\": \"" + fileName + "\",\n" +
                "      \"startLine\": 42,\n" +
                "      \"startColumn\": 1,\n" +
                "      \"endLine\": 42,\n" +
                "      \"endColumn\": 25,\n" +
                "      \"explanation\": \"Technical reason why this is an issue.\",\n" +
                "      \"confidence\": 0.95,\n" +
                "      \"suggestedFix\": \"Actionable recommendation.\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }

    public static String buildExplainPrompt(String issue, String code, String language) {
        return SYSTEM_RULES + "\n" +
                "TASK: Provide a comprehensive technical explanation of the issue below in " + language + ".\n" +
                "Issue details: " + issue + "\n\n" +
                "Code context:\n```" + language + "\n" + code + "\n```\n\n" +
                "Return valid JSON matching this schema:\n" +
                "{\n" +
                "  \"whatIsWrong\": \"Detailed description of the defect\",\n" +
                "  \"whyItHappens\": \"Underlying mechanics and preconditions leading to the defect\",\n" +
                "  \"whereItHappens\": \"Specific location, method, or statement\",\n" +
                "  \"impact\": \"Runtime consequences, security vulnerability, or degradation\",\n" +
                "  \"howToFix\": \"Step-by-step engineering solution\",\n" +
                "  \"explanation\": \"Complete markdown explanation summary\"\n" +
                "}";
    }

    public static String buildFixPrompt(String issue, String code, String language) {
        return SYSTEM_RULES + "\n" +
                "TASK: Generate a minimal, surgical patch to fix the issue in " + language + ".\n" +
                "Issue details: " + issue + "\n\n" +
                "Current code:\n```" + language + "\n" + code + "\n```\n\n" +
                "Return valid JSON with exact 1-indexed line numbers matching this schema:\n" +
                "{\n" +
                "  \"issueId\": \"Issue identifier\",\n" +
                "  \"description\": \"Concise description of the change applied\",\n" +
                "  \"edits\": [\n" +
                "    {\n" +
                "      \"startLine\": 12,\n" +
                "      \"endLine\": 12,\n" +
                "      \"original\": \"exact original line(s) being replaced\",\n" +
                "      \"replacement\": \"new replacement line(s)\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }

    public static String buildGenerateTestsPrompt(String language, String framework, String code) {
        return SYSTEM_RULES + "\n" +
                "TASK: Generate a comprehensive unit test suite in " + language + " using " + framework + ".\n" +
                "Cover: normal inputs, boundary values, empty inputs, invalid inputs, null values, exceptions, and edge cases.\n" +
                "Do NOT generate dummy tests that merely assert true == true. Test the actual logic.\n\n" +
                "Source code:\n```" + language + "\n" + code + "\n```\n\n" +
                "Return valid JSON matching this schema:\n" +
                "{\n" +
                "  \"language\": \"" + language + "\",\n" +
                "  \"framework\": \"" + framework + "\",\n" +
                "  \"testCode\": \"Complete standalone test file code\",\n" +
                "  \"testCount\": 6,\n" +
                "  \"suggestedFilePath\": \"Suggested relative file path for tests\",\n" +
                "  \"explanation\": \"Summary of test cases covered\"\n" +
                "}";
    }

    public static String buildAnalyzeErrorPrompt(String error, String code, String language) {
        return SYSTEM_RULES + "\n" +
                "TASK: Analyze the following compiler error or runtime exception trace in " + language + ".\n" +
                "Error trace:\n" + error + "\n\n" +
                "Surrounding code context (if available):\n```" + language + "\n" + (code != null ? code : "") + "\n```\n\n" +
                "Return valid JSON matching this schema:\n" +
                "{\n" +
                "  \"rootCause\": \"Primary cause of error\",\n" +
                "  \"explanation\": \"Technical explanation of why the crash or compiler failure occurred\",\n" +
                "  \"suggestedFix\": \"Concrete instructions to fix the error\",\n" +
                "  \"offendingFile\": \"Offending file if identified, or null\",\n" +
                "  \"offendingLine\": 42\n" +
                "}";
    }
}
