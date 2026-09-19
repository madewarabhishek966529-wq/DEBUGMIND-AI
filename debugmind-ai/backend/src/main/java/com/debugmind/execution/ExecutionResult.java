package com.debugmind.execution;

public class ExecutionResult {
    private final boolean success;
    private final int exitCode;
    private final String output;
    private final boolean timedOut;

    public ExecutionResult(boolean success, int exitCode, String output, boolean timedOut) {
        this.success = success;
        this.exitCode = exitCode;
        this.output = output;
        this.timedOut = timedOut;
    }

    public boolean isSuccess() { return success; }
    public int getExitCode() { return exitCode; }
    public String getOutput() { return output; }
    public boolean isTimedOut() { return timedOut; }
}
