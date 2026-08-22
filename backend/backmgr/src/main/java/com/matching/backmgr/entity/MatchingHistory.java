package com.matching.backmgr.entity;

import com.matching.backmgr.converter.MapToJsonConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "matching_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchingHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "manager_name", nullable = false)
    private String managerName;

    @Column(name = "search_topics", nullable = false, columnDefinition = "json")
    private String searchTopics;

    @Column(name = "extracted_targets", nullable = false, columnDefinition = "json")
    @Convert(converter = MapToJsonConverter.class)
    private Map<String, Integer> extractedTargets;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "SUCCESS";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
