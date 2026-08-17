package com.matching.backapp.dto;

import lombok.Data;

@Data
public class MemberRegistrationRequest {
    private String name;
    private String gender;
    private int age;
    private int height;
    private String job;
    private Integer salary;
    private String phoneNumber;
    private String kakaoId;
    private String hobbies;
    private String idealType;
    private String introduction;
    private String remarks;

    private String imageUrl1;
    private String imageUrl2;
    private String imageUrl3;
    private String imageUrl4;
    private String imageUrl5;
    
    // We assume the manager ID is passed separately via context/session or in the request body depending on auth.
    // For now, we will expect it to be passed in the request body.
    private Long managerId;

    public boolean isValidContact() {
        return (phoneNumber != null && !phoneNumber.trim().isEmpty()) ||
               (kakaoId != null && !kakaoId.trim().isEmpty());
    }
}
