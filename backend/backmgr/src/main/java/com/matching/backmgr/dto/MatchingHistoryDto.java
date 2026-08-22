package com.matching.backmgr.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class MatchingHistoryDto {
    private Long id;
    private String managerName;
    private String searchTopics;
    private Map<String, Integer> extractedTargets;
    private String status;
    private LocalDateTime createdAt;
}
