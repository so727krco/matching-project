package com.matching.backmgr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingResultDto {
    private Long memberId;
    private String name;
    private String gender;
    private int age;
    private int diffScore; // The lower, the better
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    private double rawSimilarity;
}
