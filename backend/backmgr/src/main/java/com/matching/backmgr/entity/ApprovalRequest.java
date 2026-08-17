package com.matching.backmgr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "approval_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ApprovalType type; // 'INFO_VIEW' | 'MATCH_INVITE' | 'TRANSFER'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private Manager requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_manager_id")
    private Manager targetManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_member_id")
    private Member targetMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_room_id")
    private MatchRoom matchRoom; // nullable, only for MATCH_INVITE

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // 'pending' | 'approved' | 'rejected'

    private LocalDate requestDate;

    public enum ApprovalType {
        INFO_VIEW, MATCH_INVITE, TRANSFER
    }

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED
    }
}
