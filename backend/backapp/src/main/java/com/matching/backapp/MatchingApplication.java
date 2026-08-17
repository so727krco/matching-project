package com.matching.backapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.matching.backapp", "com.matching.backmgr"})
@EntityScan(basePackages = "com.matching.backmgr.entity")
@EnableJpaRepositories(basePackages = "com.matching.backmgr.repository")
public class MatchingApplication {
    public static void main(String[] args) {
        SpringApplication.run(MatchingApplication.class, args);
    }
}
