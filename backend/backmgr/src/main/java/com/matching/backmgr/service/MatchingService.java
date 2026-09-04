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
        // 1. Get active AI Configs
        AiConfig keywordConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("MATCHING_SEARCH")
                .orElseGet(() -> aiConfigRepository.findAll().stream().filter(AiConfig::getIsActive).findFirst().orElse(null));
                
        AiConfig weightConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("MATCHING_WEIGHT")
                .orElse(keywordConfig);
        
        AiConfig embeddingConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("EMBEDDING")
                .orElse(keywordConfig);
        
        MatchingAiService keywordAiService = mockAiService; // fallback
        MatchingAiService weightAiService = mockAiService;
        
        if (keywordConfig != null && keywordConfig.getProvider() != null && keywordConfig.getProvider().toUpperCase().contains("GEMINI")) {
            log.info("Using GEMINI AI provider for Keywords");
            keywordAiService = new GeminiMatchingAiServiceImpl(
                keywordConfig.getApiUrl(),
                keywordConfig.getApiKey(), 
                embeddingConfig != null ? embeddingConfig.getApiUrl() : "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
                embeddingConfig != null ? embeddingConfig.getApiKey() : keywordConfig.getApiKey(),
                keywordConfig.getSystemPrompt(), 
                traitRefRepository, 
                objectMapper
            );
        }
        
        if (weightConfig != null && weightConfig.getProvider() != null && weightConfig.getProvider().toUpperCase().contains("GEMINI")) {
            log.info("Using GEMINI AI provider for Weights");
            weightAiService = new GeminiMatchingAiServiceImpl(
                weightConfig.getApiUrl(),
                weightConfig.getApiKey(), 
                embeddingConfig != null ? embeddingConfig.getApiUrl() : "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
                embeddingConfig != null ? embeddingConfig.getApiKey() : weightConfig.getApiKey(),
                weightConfig.getSystemPrompt(), 
                traitRefRepository, 
                objectMapper
            );
        }

        com.matching.backmgr.dto.SearchAnalysisResult analysisResult = null;
        Map<String, Integer> extractedKeywords = new HashMap<>();
        
        try {
            // Call both APIs
            extractedKeywords = keywordAiService.extractTraitWeights(request.getTopics());
            analysisResult = weightAiService.analyzeSearchQuery(request.getTopics());
            log.info("AI Extracted Analysis: Own={}, Ideal={}, Keywords={}", analysisResult.getOwnWeight(), analysisResult.getIdealWeight(), extractedKeywords.size());
            
            // Get Topic Vector from extracted standard keywords
            if (!extractedKeywords.isEmpty()) {
                String keywordsStr = String.join(", ", extractedKeywords.keySet());
                log.info("Generating embedding for extracted keywords: {}", keywordsStr);
                List<Double> topicVec = keywordAiService.getEmbedding(keywordsStr);
                if (topicVec != null && !topicVec.isEmpty()) {
                    double[] vecArray = new double[topicVec.size()];
                    for (int i = 0; i < topicVec.size(); i++) {
                        vecArray[i] = topicVec.get(i);
                    }
                    analysisResult.setTopicVector(vecArray);
                }
            } else {
                log.warn("No keywords extracted, embedding original topics as fallback.");
                List<Double> topicVec = keywordAiService.getEmbedding(String.join(", ", request.getTopics()));
                if (topicVec != null && !topicVec.isEmpty()) {
                    double[] vecArray = new double[topicVec.size()];
                    for (int i = 0; i < topicVec.size(); i++) {
                        vecArray[i] = topicVec.get(i);
                    }
                    analysisResult.setTopicVector(vecArray);
                }
            }
            
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
            throw new RuntimeException("AI 매칭 분석 중 오류가 발생했습니다.");
        }

        Map<String, Integer> extractedTargetsForHistory = new HashMap<>(extractedKeywords);
        extractedTargetsForHistory.put("ownWeight", (int)(analysisResult.getOwnWeight() * 100));
        extractedTargetsForHistory.put("idealWeight", (int)(analysisResult.getIdealWeight() * 100));

        try {
            String topicsJson = objectMapper.writeValueAsString(request.getTopics());
            MatchingHistory history = MatchingHistory.builder()
                    .managerName(request.getManagerName() != null ? request.getManagerName() : "System")
                    .searchTopics(topicsJson)
                    .extractedTargets(extractedTargetsForHistory)
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
            double[] ownVec = com.matching.backmgr.util.VectorUtil.parseVector(mt.getOwnVector());
            double[] idealVec = com.matching.backmgr.util.VectorUtil.parseVector(mt.getIdealVector());
            
            double simOwn = com.matching.backmgr.util.VectorUtil.calculateCosineSimilarity(analysisResult.getTopicVector(), ownVec);
            double simIdeal = com.matching.backmgr.util.VectorUtil.calculateCosineSimilarity(analysisResult.getTopicVector(), idealVec);
            
            double finalSimilarity = (simOwn * analysisResult.getOwnWeight()) + (simIdeal * analysisResult.getIdealWeight());
            
            int diffScore = (int)((1.0 - finalSimilarity) * 50.0);
            if (diffScore < 0) diffScore = 0;
            if (diffScore > 100) diffScore = 100;
            
            MatchingResultDto dto = MatchingResultDto.builder()
                    .memberId(mt.getMember().getId())
                    .name(mt.getMember().getName())
                    .gender(mt.getMember().getGender())
                    .age(mt.getMember().getAge())
                    .diffScore(diffScore)
                    .rawSimilarity(finalSimilarity)
                    .build();

            if ("M".equals(mt.getMember().getGender())) {
                maleCandidates.add(dto);
            } else {
                femaleCandidates.add(dto);
            }
        }

        maleCandidates.sort(Comparator.comparingDouble(MatchingResultDto::getRawSimilarity).reversed());
        femaleCandidates.sort(Comparator.comparingDouble(MatchingResultDto::getRawSimilarity).reversed());

        List<MatchingResultDto> topMales = maleCandidates.stream().limit(request.getMaleCount()).collect(Collectors.toList());
        List<MatchingResultDto> topFemales = femaleCandidates.stream().limit(request.getFemaleCount()).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("extractedTargets", extractedTargetsForHistory);
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
