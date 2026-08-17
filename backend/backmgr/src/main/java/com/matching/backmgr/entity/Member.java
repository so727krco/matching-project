package com.matching.backmgr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String gender; // "M" or "F"

    @Column(nullable = false)
    private int age;
    
    // 키
    private int height;
    
    @Column(nullable = false)
    private String job;
    
    @Column(nullable = false)
    private Integer salary;

    // 연락처 (둘 중 하나 필수 로직은 서비스에서 검증)
    private String phoneNumber;
    private String kakaoId;

    @Column(nullable = false)
    private String hobbies;

    @Column(nullable = false, length = 1000)
    private String idealType;

    @Column(nullable = false, length = 2000)
    private String introduction;

    @Column(nullable = false, length = 1000)
    private String remarks;

    // 프로필 이미지 URL 5개
    private String imageUrl1;
    private String imageUrl2;
    private String imageUrl3;
    private String imageUrl4;
    private String imageUrl5;

    @Enumerated(EnumType.STRING)
    private MemberStatus status; // '심사중' | '활동중' | '휴면'

    // AI Verification Results
    private Boolean aiVerificationPassed;
    private String aiRemarks;

    // ManyToOne relationship with Manager
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Manager manager;

    public enum MemberStatus {
        PENDING, ACTIVE, INACTIVE
    }
}
