package com.matching.backmgr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ai_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider; // GEMINI, OPENAI, MOCK

    @Column(columnDefinition = "TEXT")
    private String apiKey;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(columnDefinition = "TEXT")
    private String systemPrompt;
    
    @Column(name = "usage_type")
    private String usageType; // e.g., "MATCHING_SEARCH", "MEMBER_PROFILING"

    @Column(name = "api_url", length = 500)
    private String apiUrl;
}
