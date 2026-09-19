package com.debugmind.exception;

public class AIProviderException extends RuntimeException {
    private final int statusCode;

    public AIProviderException(String message) {
        super(message);
        this.statusCode = 500;
    }

    public AIProviderException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public AIProviderException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 500;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
