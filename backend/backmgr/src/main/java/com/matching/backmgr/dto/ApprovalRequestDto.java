package com.matching.backmgr.dto;

import com.matching.backmgr.entity.ApprovalRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRequestDto {
    private Long id;
    private String type;
    private Long requesterId;
    private String requesterName;
    private Long targetManagerId;
    private String targetManagerName;
    private Long targetMemberId;
    private String targetMemberName;
    private Long matchId;
    private String status;
    private LocalDate requestDate;

    public static ApprovalRequestDto fromEntity(ApprovalRequest entity) {
        return ApprovalRequestDto.builder()
                .id(entity.getId())
                .type(entity.getType() != null ? entity.getType().name() : null)
                .requesterId(entity.getRequester() != null ? entity.getRequester().getId() : null)
                .requesterName(entity.getRequester() != null ? entity.getRequester().getName() : null)
                .targetManagerId(entity.getTargetManager() != null ? entity.getTargetManager().getId() : null)
                .targetManagerName(entity.getTargetManager() != null ? entity.getTargetManager().getName() : null)
                .targetMemberId(entity.getTargetMember() != null ? entity.getTargetMember().getId() : null)
                .targetMemberName(entity.getTargetMember() != null ? entity.getTargetMember().getName() : null)
                .matchId(entity.getMatchRoom() != null ? entity.getMatchRoom().getId() : null)
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .requestDate(entity.getRequestDate())
                .build();
    }
}
