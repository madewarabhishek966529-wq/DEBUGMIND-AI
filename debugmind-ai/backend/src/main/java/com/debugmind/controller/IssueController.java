package com.debugmind.controller;

import com.debugmind.dto.request.ExplainRequest;
import com.debugmind.dto.request.FixRequest;
import com.debugmind.dto.response.ExplainResponse;
import com.debugmind.dto.response.FixResponse;
import com.debugmind.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping("/explain")
    public ResponseEntity<ExplainResponse> explain(@Valid @RequestBody ExplainRequest request) {
        ExplainResponse response = issueService.explain(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fix")
    public ResponseEntity<FixResponse> fix(@Valid @RequestBody FixRequest request) {
        FixResponse response = issueService.generateFix(request);
        return ResponseEntity.ok(response);
    }
}
