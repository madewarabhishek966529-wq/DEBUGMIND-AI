package com.debugmind.dto.response;

public class VerifyFixResponse {
    private String status;           // VERIFIED, FAILED, PARTIAL, NOT_RUN, UNSUPPORTED
    private int passed;
    private int failed;
    private boolean compileSuccess;
    private String summary;
    private String output;

    public VerifyFixResponse() {}

    public VerifyFixResponse(String status, int passed, int failed, boolean compileSuccess, String summary, String output) {
        this.status = status;
        this.passed = passed;
        this.failed = failed;
        this.compileSuccess = compileSuccess;
        this.summary = summary;
        this.output = output;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getPassed() { return passed; }
    public void setPassed(int passed) { this.passed = passed; }

    public int getFailed() { return failed; }
    public void setFailed(int failed) { this.failed = failed; }

    public boolean isCompileSuccess() { return compileSuccess; }
    public void setCompileSuccess(boolean compileSuccess) { this.compileSuccess = compileSuccess; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }
}
