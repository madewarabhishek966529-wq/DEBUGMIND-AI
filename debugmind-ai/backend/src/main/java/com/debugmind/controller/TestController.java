package com.debugmind.controller;

import com.debugmind.dto.request.GenerateTestRequest;
import com.debugmind.dto.response.GenerateTestResponse;
import com.debugmind.service.TestGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tests")
public class TestController {

    private final TestGenerationService testService;

    public TestController(TestGenerationService testService) {
        this.testService = testService;
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerateTestResponse> generate(@Valid @RequestBody GenerateTestRequest request) {
        GenerateTestResponse response = testService.generateTests(request);
        return ResponseEntity.ok(response);
    }
}
