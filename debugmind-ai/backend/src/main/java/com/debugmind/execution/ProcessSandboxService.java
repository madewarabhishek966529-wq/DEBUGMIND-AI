package com.debugmind.execution;

import com.debugmind.dto.response.VerifyFixResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProcessSandboxService {
    private static final Logger log = LoggerFactory.getLogger(ProcessSandboxService.class);

    private final SandboxConfig config;

    public ProcessSandboxService(SandboxConfig config) {
        this.config = config;
    }

    public VerifyFixResponse verifyFix(String language, String fileName, String code, String testCode) {
        String lang = (language != null ? language.toLowerCase() : "unknown");
        Path tempDir = null;

        try {
            tempDir = createTempSandbox();
            String safeFileName = (fileName != null && !fileName.isBlank()) ? Path.of(fileName).getFileName().toString() : "SourceFile";
            Path sourceFilePath = tempDir.resolve(safeFileName);
            Files.writeString(sourceFilePath, code != null ? code : "", StandardCharsets.UTF_8);

            // 1. Run compilation / syntax verification check
            ExecutionResult compileResult = runCompileCheck(lang, sourceFilePath, tempDir);
            if (!compileResult.isSuccess()) {
                return new VerifyFixResponse(
                        "FAILED",
                        0,
                        1,
                        false,
                        "Syntax / compilation check failed: " + sanitizeOutput(compileResult.getOutput()),
                        compileResult.getOutput()
                );
            }

            // 2. Run tests if test code is provided or present
            if (testCode != null && !testCode.isBlank()) {
                Path testFilePath = tempDir.resolve("Test_" + safeFileName);
                Files.writeString(testFilePath, testCode, StandardCharsets.UTF_8);

                ExecutionResult testResult = runTests(lang, testFilePath, sourceFilePath, tempDir);
                return parseTestResults(testResult);
            }

            // If only compile succeeded and no tests to run
            return new VerifyFixResponse(
                    "PARTIAL",
                    1,
                    0,
                    true,
                    "Syntax validation succeeded. No automated test suite provided to verify behavior.",
                    compileResult.getOutput()
            );

        } catch (Exception e) {
            log.error("Sandbox verification error", e);
            return new VerifyFixResponse(
                    "FAILED",
                    0,
                    1,
                    false,
                    "Sandbox runner error: " + e.getMessage(),
                    e.getMessage()
            );
        } finally {
            if (tempDir != null) {
                cleanupTempSandbox(tempDir);
            }
        }
    }

    private ExecutionResult runCompileCheck(String lang, Path sourceFile, Path workDir) {
        List<String> command;

        switch (lang) {
            case "java":
                command = List.of("javac", sourceFile.getFileName().toString());
                break;
            case "javascript":
                command = List.of("node", "--check", sourceFile.getFileName().toString());
                break;
            case "python":
                command = List.of("python", "-m", "py_compile", sourceFile.getFileName().toString());
                break;
            case "c":
                command = List.of("gcc", "-fsyntax-only", sourceFile.getFileName().toString());
                break;
            case "cpp":
                command = List.of("g++", "-fsyntax-only", sourceFile.getFileName().toString());
                break;
            case "php":
                command = List.of("php", "-l", sourceFile.getFileName().toString());
                break;
            default:
                // Unsupported language for local compile check
                return new ExecutionResult(true, 0, "Language compiler not configured for " + lang, false);
        }

        return executeCommand(command, workDir);
    }

    private ExecutionResult runTests(String lang, Path testFile, Path sourceFile, Path workDir) {
        List<String> command;

        switch (lang) {
            case "javascript":
            case "typescript":
                command = List.of("node", testFile.getFileName().toString());
                break;
            case "python":
                command = List.of("pytest", testFile.getFileName().toString(), "-v");
                break;
            case "java":
                command = List.of("javac", sourceFile.getFileName().toString(), testFile.getFileName().toString());
                break;
            default:
                return new ExecutionResult(false, 1, "Test execution unsupported for language: " + lang, false);
        }

        return executeCommand(command, workDir);
    }

    private VerifyFixResponse parseTestResults(ExecutionResult result) {
        String out = result.getOutput();
        boolean success = result.isSuccess();

        int passed = 0;
        int failed = 0;

        // Parse patterns like "X passed, Y failed" or "Tests run: X, Failures: Y"
        Pattern pytestPattern = Pattern.compile("(\\d+)\\s+passed");
        Matcher pytestMatcher = pytestPattern.matcher(out);
        if (pytestMatcher.find()) {
            passed = Integer.parseInt(pytestMatcher.group(1));
        }

        Pattern failPattern = Pattern.compile("(\\d+)\\s+failed");
        Matcher failMatcher = failPattern.matcher(out);
        if (failMatcher.find()) {
            failed = Integer.parseInt(failMatcher.group(1));
        }

        if (success && failed == 0) {
            if (passed == 0) passed = 1; // At least one successful assertion
            return new VerifyFixResponse(
                    "VERIFIED",
                    passed,
                    0,
                    true,
                    "All verification checks passed (" + passed + " passed, 0 failed).",
                    out
            );
        } else {
            if (failed == 0) failed = 1;
            return new VerifyFixResponse(
                    "FAILED",
                    passed,
                    failed,
                    true,
                    "Verification failed: " + failed + " test(s) failed.",
                    out
            );
        }
    }

    private ExecutionResult executeCommand(List<String> command, Path workDir) {
        Process process = null;
        StringBuilder output = new StringBuilder();
        boolean timedOut = false;

        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.directory(workDir.toFile());
            pb.redirectErrorStream(true);

            // Environment Sanitization: remove sensitive environment variables
            Map<String, String> env = pb.environment();
            env.entrySet().removeIf(entry -> {
                String key = entry.getKey().toUpperCase();
                return key.contains("KEY") || key.contains("SECRET") || key.contains("TOKEN") || key.contains("PASSWORD");
            });

            process = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (output.length() < 100000) { // Limit output buffer
                        output.append(line).append("\n");
                    }
                }
            }

            boolean finished = process.waitFor(config.getTimeoutSeconds(), TimeUnit.SECONDS);
            if (!finished) {
                timedOut = true;
                process.destroyForcibly();
                return new ExecutionResult(false, -1, "Execution timed out after " + config.getTimeoutSeconds() + " seconds.\n" + output, true);
            }

            int exitCode = process.exitValue();
            return new ExecutionResult(exitCode == 0, exitCode, output.toString(), false);

        } catch (Exception e) {
            return new ExecutionResult(false, -1, "Failed to launch process: " + e.getMessage(), false);
        } finally {
            if (process != null && process.isAlive()) {
                process.destroyForcibly();
            }
        }
    }

    private Path createTempSandbox() throws Exception {
        if (!config.getCustomTempDir().isBlank()) {
            Path custom = Path.of(config.getCustomTempDir());
            Files.createDirectories(custom);
            return Files.createTempDirectory(custom, "dm-sandbox-");
        }
        return Files.createTempDirectory("debugmind-sandbox-");
    }

    private void cleanupTempSandbox(Path tempDir) {
        try {
            Files.walk(tempDir)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (Exception e) {
            log.warn("Failed to completely delete temp sandbox directory: {}", e.getMessage());
        }
    }

    private String sanitizeOutput(String output) {
        if (output == null) return "";
        return output.length() > 500 ? output.substring(0, 500) + "..." : output;
    }
}
