package com.matching.backapp.controller;

import com.matching.backmgr.dto.MatchingHistoryDto;
import com.matching.backmgr.dto.MatchingRequestDto;
import com.matching.backmgr.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*") // For local testing
public class MatchingController {

    private final MatchingService matchingService;

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeMatching(@RequestBody MatchingRequestDto request) {
        Map<String, Object> result = matchingService.executeMatching(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<MatchingHistoryDto>> getHistory() {
        return ResponseEntity.ok(matchingService.getMatchingHistory());
    }
}
