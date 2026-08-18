package com.matching.backapp.controller;

import com.matching.backmgr.dto.ApprovalRequestDto;
import com.matching.backmgr.service.ApprovalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalRequestController {

    private final ApprovalRequestService approvalRequestService;

    @PostMapping
    public ResponseEntity<ApprovalRequestDto> createRequest(@RequestBody Map<String, Object> requestBody) {
        String type = (String) requestBody.get("type");
        Long requesterId = Long.valueOf(requestBody.get("requesterId").toString());
        Long targetManagerId = Long.valueOf(requestBody.get("targetManagerId").toString());
        Long targetMemberId = Long.valueOf(requestBody.get("targetMemberId").toString());
        
        return ResponseEntity.ok(approvalRequestService.createRequest(type, requesterId, targetManagerId, targetMemberId));
    }

    @GetMapping
    public ResponseEntity<List<ApprovalRequestDto>> getApprovalRequests(@RequestParam Long managerId) {
        return ResponseEntity.ok(approvalRequestService.getApprovalRequestsForManager(managerId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveRequest(@PathVariable Long id) {
        approvalRequestService.approveRequest(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectRequest(@PathVariable Long id) {
        approvalRequestService.rejectRequest(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelRequest(@PathVariable Long id) {
        approvalRequestService.cancelRequest(id);
        return ResponseEntity.ok().build();
    }
}
