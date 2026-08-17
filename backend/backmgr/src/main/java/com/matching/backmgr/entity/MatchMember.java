package com.matching.backmgr.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "match_member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_room_id")
    private MatchRoom matchRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Enumerated(EnumType.STRING)
    private MatchApprovalStatus approvalStatus; // 'pending' | 'approved' | 'rejected'

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // 'pending' | 'completed'

    public enum MatchApprovalStatus {
        PENDING, APPROVED, REJECTED
    }

    public enum PaymentStatus {
        PENDING, COMPLETED
    }
}
