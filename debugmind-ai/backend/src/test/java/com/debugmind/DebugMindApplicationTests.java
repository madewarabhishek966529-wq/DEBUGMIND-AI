package com.debugmind;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class DebugMindApplicationTests {

    @Test
    void contextLoads() {
        // Confirms Spring application context initializes cleanly
    }
}
