package com.matching.backmgr.dto;

import lombok.Data;
import java.util.Map;

@Data
public class AiProfileResult {
    private Map<String, Integer> traits;
    private Map<String, Integer> idealTraits;
    private String analysisRemarks;
}
