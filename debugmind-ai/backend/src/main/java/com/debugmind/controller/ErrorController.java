package com.debugmind.controller;

import com.debugmind.dto.request.ErrorAnalyzeRequest;
import com.debugmind.dto.response.ErrorAnalyzeResponse;
import com.debugmind.service.ErrorAnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/errors")
public class ErrorController {

    private final ErrorAnalysisService errorService;

    public ErrorController(ErrorAnalysisService errorService) {
        this.errorService = errorService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<ErrorAnalyzeResponse> analyze(@Valid @RequestBody ErrorAnalyzeRequest request) {
        ErrorAnalyzeResponse response = errorService.analyzeError(request);
        return ResponseEntity.ok(response);
    }
}
