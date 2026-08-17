package com.matching.backmgr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "couple")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Couple {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_room_id")
    private MatchRoom matchRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "male_member_id")
    private Member maleMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "female_member_id")
    private Member femaleMember;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private CoupleStatus status; // 'active' | 'breakup'

    public enum CoupleStatus {
        ACTIVE, BREAKUP
    }
}
