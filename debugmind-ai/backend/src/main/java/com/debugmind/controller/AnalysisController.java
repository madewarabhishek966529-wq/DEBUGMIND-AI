package com.debugmind.controller;

import com.debugmind.dto.request.AnalyzeRequest;
import com.debugmind.dto.response.AnalyzeResponse;
import com.debugmind.service.AnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(@Valid @RequestBody AnalyzeRequest request) {
        AnalyzeResponse response = analysisService.analyze(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analyses")
    public ResponseEntity<List<AnalyzeResponse>> getAnalyses() {
        return ResponseEntity.ok(analysisService.getRecentAnalyses());
    }
}
