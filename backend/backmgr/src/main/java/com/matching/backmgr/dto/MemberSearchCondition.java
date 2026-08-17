package com.matching.backmgr.dto;

import lombok.Data;

@Data
public class MemberSearchCondition {
    private String name;
    private String gender; // "M" or "F" or "전체" handled at controller or query
    private Integer minAge;
    private Integer maxAge;
    private Integer minSalary; // in 10,000 KRW (만원)
    private String managerEmpNo;
}
