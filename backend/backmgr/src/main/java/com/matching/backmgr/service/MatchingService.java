package com.matching.backmgr.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matching.backmgr.dto.MatchingHistoryDto;
import com.matching.backmgr.dto.MatchingRequestDto;
import com.matching.backmgr.dto.MatchingResultDto;
import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.entity.MatchingHistory;
import com.matching.backmgr.entity.MemberTrait;
import com.matching.backmgr.repository.AiConfigRepository;
import com.matching.backmgr.repository.MatchingHistoryRepository;
import com.matching.backmgr.repository.MemberTraitRepository;
import com.matching.backmgr.repository.MatchingTraitReferenceRepository;
import com.matching.backmgr.service.impl.GeminiMatchingAiServiceImpl;
import com.matching.backmgr.service.impl.MockMatchingAiServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final MockMatchingAiServiceImpl mockAiService;
    private final MemberTraitRepository memberTraitRepository;
    private final MatchingHistoryRepository matchingHistoryRepository;
    private final AiConfigRepository aiConfigRepository;
    private final MatchingTraitReferenceRepository traitRefRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Map<String, Object> executeMatching(MatchingRequestDto request) {
        // 1. Get active AI Config
        AiConfig activeConfig = aiConfigRepository.findByIsActiveTrue().orElse(null);
        
        MatchingAiService aiServiceToUse = mockAiService; // fallback
        
        if (activeConfig != null && "GEMINI".equalsIgnoreCase(activeConfig.getProvider())) {
            log.info("Using GEMINI AI provider");
            aiServiceToUse = new GeminiMatchingAiServiceImpl(
                activeConfig.getApiKey(), 
                activeConfig.getSystemPrompt(), 
                traitRefRepository, 
                objectMapper
            );
        } else {
            log.info("Using MOCK AI provider");
        }

        Map<String, Integer> targetWeights = aiServiceToUse.extractTraitWeights(request.getTopics());
        log.info("AI Extracted Targets: {}", targetWeights);

        try {
            String topicsJson = objectMapper.writeValueAsString(request.getTopics());
            MatchingHistory history = MatchingHistory.builder()
                    .managerName(request.getManagerName() != null ? request.getManagerName() : "System")
                    .searchTopics(topicsJson)
                    .extractedTargets(targetWeights)
                    .build();
            matchingHistoryRepository.save(history);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse topics to JSON", e);
        }

        List<MemberTrait> allMemberTraits = memberTraitRepository.findAll();
        List<MatchingResultDto> maleCandidates = new ArrayList<>();
        List<MatchingResultDto> femaleCandidates = new ArrayList<>();

        for (MemberTrait mt : allMemberTraits) {
            int diffScore = calculateDistance(targetWeights, mt.getTraits());
            MatchingResultDto dto = MatchingResultDto.builder()
                    .memberId(mt.getMember().getId())
                    .name(mt.getMember().getName())
                    .gender(mt.getMember().getGender())
                    .age(mt.getMember().getAge())
                    .diffScore(diffScore)
                    .build();

            if ("M".equals(mt.getMember().getGender())) {
                maleCandidates.add(dto);
            } else {
                femaleCandidates.add(dto);
            }
        }

        maleCandidates.sort(Comparator.comparingInt(MatchingResultDto::getDiffScore));
        femaleCandidates.sort(Comparator.comparingInt(MatchingResultDto::getDiffScore));

        List<MatchingResultDto> topMales = maleCandidates.stream().limit(request.getMaleCount()).collect(Collectors.toList());
        List<MatchingResultDto> topFemales = femaleCandidates.stream().limit(request.getFemaleCount()).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("extractedTargets", targetWeights);
        response.put("males", topMales);
        response.put("females", topFemales);
        return response;
    }

    private int calculateDistance(Map<String, Integer> targetWeights, Map<String, Integer> memberTraits) {
        int totalDiff = 0;
        for (Map.Entry<String, Integer> entry : targetWeights.entrySet()) {
            String keyword = entry.getKey();
            int targetScore = entry.getValue();
            int memberScore = memberTraits.getOrDefault(keyword, 0);
            totalDiff += Math.abs(targetScore - memberScore);
        }
        return totalDiff;
    }

    @Transactional(readOnly = true)
    public List<MatchingHistoryDto> getMatchingHistory() {
        return matchingHistoryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(history -> MatchingHistoryDto.builder()
                        .id(history.getId())
                        .managerName(history.getManagerName())
                        .searchTopics(history.getSearchTopics())
                        .extractedTargets(history.getExtractedTargets())
                        .createdAt(history.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
