package com.matching.backmgr.dto;

import lombok.Data;
import java.util.Map;

@Data
public class AiProfileResult {
    private Map<String, Integer> traits;
    private String analysisRemarks;
}
