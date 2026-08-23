package com.matching.backmgr.dto;

import lombok.Data;
import java.util.Map;

@Data
public class AiPhotoResult {
    private boolean finalPassed;
    private String reason;
    private Map<String, Integer> appearanceTraits;
}
