package com.matching.backmgr.dto;

import lombok.Data;

@Data
public class SearchAnalysisResult {
    private double ownWeight;
    private double idealWeight;
    private double[] topicVector;
}
