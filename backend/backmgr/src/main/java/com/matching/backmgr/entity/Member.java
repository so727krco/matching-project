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

    private String name;
    private int age;
    private int height;
    private String job;
    private String salary;
    private String photoUrl;

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
