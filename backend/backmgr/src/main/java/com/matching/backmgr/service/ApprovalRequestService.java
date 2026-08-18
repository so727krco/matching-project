package com.matching.backmgr.service;

import com.matching.backmgr.dto.ApprovalRequestDto;
import com.matching.backmgr.entity.ApprovalRequest;
import com.matching.backmgr.entity.Manager;
import com.matching.backmgr.entity.Member;
import com.matching.backmgr.repository.ApprovalRequestRepository;
import com.matching.backmgr.repository.ManagerRepository;
import com.matching.backmgr.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalRequestService {

    private final ApprovalRequestRepository approvalRequestRepository;
    private final MemberRepository memberRepository;
    private final ManagerRepository managerRepository;

    @Transactional
    public ApprovalRequestDto createRequest(String type, Long requesterId, Long targetManagerId, Long targetMemberId) {
        Manager requester = managerRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid requester ID: " + requesterId));
        Manager targetManager = managerRepository.findById(targetManagerId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid target manager ID: " + targetManagerId));
        Member targetMember = memberRepository.findById(targetMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid target member ID: " + targetMemberId));

        ApprovalRequest request = ApprovalRequest.builder()
                .type(ApprovalRequest.ApprovalType.valueOf(type))
                .requester(requester)
                .targetManager(targetManager)
                .targetMember(targetMember)
                .status(ApprovalRequest.RequestStatus.PENDING)
                .requestDate(LocalDate.now())
                .build();

        approvalRequestRepository.save(request);
        return ApprovalRequestDto.fromEntity(request);
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestDto> getApprovalRequestsForManager(Long managerId) {
        return approvalRequestRepository.findByTargetManagerId(managerId).stream()
                .map(ApprovalRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveRequest(Long requestId) {
        ApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid request ID: " + requestId));
        
        request.setStatus(ApprovalRequest.RequestStatus.APPROVED);

        // Apply business logic
        if (request.getType() == ApprovalRequest.ApprovalType.TRANSFER) {
            Member member = request.getTargetMember();
            if (member != null) {
                // Update manager
                member.setManager(request.getTargetManager());
                memberRepository.save(member);
            }
        }
        // INFO_VIEW just changes status and is checked at query time
        
        approvalRequestRepository.save(request);
    }

    @Transactional
    public void rejectRequest(Long requestId) {
        ApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid request ID: " + requestId));
        
        request.setStatus(ApprovalRequest.RequestStatus.REJECTED);
        approvalRequestRepository.save(request);
    }

    @Transactional
    public void cancelRequest(Long requestId) {
        ApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid request ID: " + requestId));
        
        request.setStatus(ApprovalRequest.RequestStatus.PENDING);

        // Rollback business logic if necessary
        if (request.getType() == ApprovalRequest.ApprovalType.TRANSFER) {
            Member member = request.getTargetMember();
            if (member != null) {
                // Revert to requester
                member.setManager(request.getRequester());
                memberRepository.save(member);
            }
        }
        
        approvalRequestRepository.save(request);
    }
}
