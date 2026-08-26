package com.matching.backapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.matching.backmgr.entity.MatchingTraitReference;
import com.matching.backmgr.repository.MatchingTraitReferenceRepository;
import com.matching.backmgr.service.MatchingAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.repository.AiConfigRepository;
import com.matching.backmgr.service.impl.GeminiMatchingAiServiceImpl;
import com.matching.backmgr.service.impl.MockMatchingAiServiceImpl;

@RestController
@RequestMapping("/api/admin/embeddings")
@RequiredArgsConstructor
@Slf4j
public class AiEmbeddingAdminController {

    private final MatchingTraitReferenceRepository traitRefRepository;
    private final AiConfigRepository aiConfigRepository;
    private final MockMatchingAiServiceImpl mockAiService;
    private final ObjectMapper objectMapper;

    private MatchingAiService getAiService() {
        AiConfig textConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("MATCHING_SEARCH")
                .orElseGet(() -> aiConfigRepository.findAll().stream().filter(AiConfig::getIsActive).findFirst().orElse(null));
        
        AiConfig embeddingConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("EMBEDDING")
                .orElse(textConfig); // Fallback to text config if EMBEDDING is not defined

        if (textConfig != null && "GEMINI".equalsIgnoreCase(textConfig.getProvider())) {
            return new GeminiMatchingAiServiceImpl(
                    textConfig.getApiUrl(),
                    textConfig.getApiKey(),
                    embeddingConfig != null ? embeddingConfig.getApiUrl() : "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
                    embeddingConfig != null ? embeddingConfig.getApiKey() : textConfig.getApiKey(),
                    textConfig.getSystemPrompt(),
                    traitRefRepository,
                    objectMapper
            );
        }
        return mockAiService;
    }

    @PostMapping("/fill-existing")
    public ResponseEntity<String> fillExistingEmbeddings() {
        List<MatchingTraitReference> allTraits = traitRefRepository.findAll();
        int updatedCount = 0;
        for (MatchingTraitReference trait : allTraits) {
            if (trait.getEmbeddingData() == null || trait.getEmbeddingData().isEmpty()) {
                try {
                    List<Double> embedding = getAiService().getEmbedding(trait.getKeyword());
                    if (!embedding.isEmpty()) {
                        String embeddingJson = objectMapper.writeValueAsString(embedding);
                        trait.setEmbeddingData(embeddingJson);
                        traitRefRepository.save(trait);
                        updatedCount++;
                        log.info("Updated embedding for keyword: {}", trait.getKeyword());
                    }
                } catch (Exception e) {
                    log.error("Failed to update embedding for keyword: {}", trait.getKeyword(), e);
                }
            }
        }
        return ResponseEntity.ok("Successfully updated " + updatedCount + " existing traits with vector embeddings.");
    }

    @PostMapping("/add")
    public ResponseEntity<String> addOrUpdateKeyword(
            @RequestParam String category,
            @RequestParam String keyword) {
        
        Optional<MatchingTraitReference> existingOpt = traitRefRepository.findAll().stream()
                .filter(t -> t.getKeyword().equalsIgnoreCase(keyword))
                .findFirst();

        MatchingTraitReference trait;
        if (existingOpt.isPresent()) {
            trait = existingOpt.get();
            log.info("Keyword '{}' already exists. Updating its vector embedding.", keyword);
        } else {
            trait = new MatchingTraitReference();
            trait.setCategory(category);
            trait.setKeyword(keyword);
            log.info("Keyword '{}' does not exist. Creating new entry.", keyword);
        }

        try {
            List<Double> embedding = getAiService().getEmbedding(keyword);
            if (embedding.isEmpty()) {
                return ResponseEntity.internalServerError().body("Failed to fetch embedding from AI API.");
            }
            String embeddingJson = objectMapper.writeValueAsString(embedding);
            trait.setEmbeddingData(embeddingJson);
            traitRefRepository.save(trait);
            return ResponseEntity.ok("Successfully saved vector embedding for keyword: " + keyword);
        } catch (Exception e) {
            log.error("Error saving keyword embedding", e);
            return ResponseEntity.internalServerError().body("Error processing embedding.");
        }
    }
}
