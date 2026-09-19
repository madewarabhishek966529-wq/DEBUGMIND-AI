package com.debugmind;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class DebugMindApplication {
    private static final Logger log = LoggerFactory.getLogger(DebugMindApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(DebugMindApplication.class, args);
        log.info("🧠 DebugMind AI Backend started successfully. Ready for VS Code Extension connections.");
    }
}
