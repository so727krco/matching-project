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
        AiConfig activeConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("MATCHING_SEARCH")
                .orElseGet(() -> aiConfigRepository.findAll().stream().filter(AiConfig::getIsActive).findFirst().orElse(null));
        
        AiConfig embeddingConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("EMBEDDING")
                .orElse(activeConfig);
        
        MatchingAiService aiServiceToUse = mockAiService; // fallback
        
        if (activeConfig != null && "GEMINI".equalsIgnoreCase(activeConfig.getProvider())) {
            log.info("Using GEMINI AI provider");
            aiServiceToUse = new GeminiMatchingAiServiceImpl(
                activeConfig.getApiUrl(),
                activeConfig.getApiKey(), 
                embeddingConfig != null ? embeddingConfig.getApiUrl() : "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
                embeddingConfig != null ? embeddingConfig.getApiKey() : activeConfig.getApiKey(),
                activeConfig.getSystemPrompt(), 
                traitRefRepository, 
                objectMapper
            );
        } else {
            log.info("Using MOCK AI provider");
        }

        Map<String, Integer> targetWeights = new HashMap<>();
        try {
            targetWeights = aiServiceToUse.extractTraitWeights(request.getTopics());
            log.info("AI Extracted Targets: {}", targetWeights);
        } catch (Exception aiException) {
            log.error("AI Filtering or Parsing Error", aiException);
            // Save blocked history
            try {
                String topicsJson = objectMapper.writeValueAsString(request.getTopics());
                Map<String, Integer> errorTargets = new HashMap<>();
                errorTargets.put("BLOCKED_BY_SAFETY_FILTER", -1);
                
                MatchingHistory history = MatchingHistory.builder()
                        .managerName(request.getManagerName() != null ? request.getManagerName() : "System")
                        .searchTopics(topicsJson)
                        .extractedTargets(errorTargets)
                        .status("ERROR_BLOCKED")
                        .build();
                matchingHistoryRepository.save(history);
            } catch (Exception e) {
                log.error("Failed to save blocked history", e);
            }
            throw new RuntimeException("AI 매칭 필터링 오류: 부적절한 단어가 포함되었거나 AI가 응답을 거부했습니다. 관리자에게 문의하세요.");
        }

        try {
            String topicsJson = objectMapper.writeValueAsString(request.getTopics());
            MatchingHistory history = MatchingHistory.builder()
                    .managerName(request.getManagerName() != null ? request.getManagerName() : "System")
                    .searchTopics(topicsJson)
                    .extractedTargets(targetWeights)
                    .status("SUCCESS")
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
                        .status(history.getStatus()) // Added status to DTO
                        .createdAt(history.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
