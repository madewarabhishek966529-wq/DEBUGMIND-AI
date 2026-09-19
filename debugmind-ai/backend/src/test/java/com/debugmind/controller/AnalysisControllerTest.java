package com.debugmind.controller;

import com.debugmind.dto.request.AnalyzeRequest;
import com.debugmind.dto.request.ExplainRequest;
import com.debugmind.dto.request.FixRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.aiProvider").value("gemini"))
                .andExpect(jsonPath("$.sandboxAvailable").value(true));
    }

    @Test
    void testAnalyzeEndpoint() throws Exception {
        AnalyzeRequest req = new AnalyzeRequest();
        req.setLanguage("java");
        req.setFileName("UserService.java");
        req.setCode("public class UserService { public String getName(User u) { return u.getName(); } }");

        mockMvc.perform(post("/api/v1/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore").isNumber())
                .andExpect(jsonPath("$.issues").isArray());
    }

    @Test
    void testExplainEndpoint() throws Exception {
        ExplainRequest req = new ExplainRequest();
        req.setIssueId("DM-001");
        req.setTitle("Possible NullPointerException");
        req.setCategory("BUG");
        req.setStartLine(2);
        req.setEndLine(2);
        req.setExplanation("u may be null");
        req.setCode("return u.getName();");
        req.setLanguage("java");
        req.setFileName("UserService.java");

        mockMvc.perform(post("/api/v1/issues/explain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.whatIsWrong").exists())
                .andExpect(jsonPath("$.howToFix").exists());
    }

    @Test
    void testFixEndpoint() throws Exception {
        FixRequest req = new FixRequest();
        req.setIssueId("DM-001");
        req.setTitle("Possible NullPointerException");
        req.setCategory("BUG");
        req.setExplanation("u may be null");
        req.setStartLine(2);
        req.setEndLine(2);
        req.setLanguage("java");
        req.setFileName("UserService.java");
        req.setCode("return u.getName();");

        mockMvc.perform(post("/api/v1/issues/fix")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.issueId").value("DM-001"))
                .andExpect(jsonPath("$.edits").isArray());
    }

    @Test
    void testAnalyzeValidationError() throws Exception {
        AnalyzeRequest emptyReq = new AnalyzeRequest(); // Missing language and code

        mockMvc.perform(post("/api/v1/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
