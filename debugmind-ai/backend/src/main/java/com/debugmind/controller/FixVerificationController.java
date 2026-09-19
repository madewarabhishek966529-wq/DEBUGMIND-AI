package com.debugmind.controller;

import com.debugmind.dto.request.VerifyFixRequest;
import com.debugmind.dto.response.VerifyFixResponse;
import com.debugmind.service.FixVerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fixes")
public class FixVerificationController {

    private final FixVerificationService verificationService;

    public FixVerificationController(FixVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyFixResponse> verify(@Valid @RequestBody VerifyFixRequest request) {
        VerifyFixResponse response = verificationService.verify(request);
        return ResponseEntity.ok(response);
    }
}
