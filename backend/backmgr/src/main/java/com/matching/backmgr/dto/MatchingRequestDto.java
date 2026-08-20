package com.matching.backmgr.dto;

import lombok.Data;
import java.util.List;

@Data
public class MatchingRequestDto {
    private List<String> topics;
    private int maleCount;
    private int femaleCount;
    private String managerName;
}
