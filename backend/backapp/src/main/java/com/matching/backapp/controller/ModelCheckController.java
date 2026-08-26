package com.matching.backapp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.repository.AiConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@Slf4j
@RestController
@RequestMapping("/api/admin/models")
@RequiredArgsConstructor
public class ModelCheckController {

    private final AiConfigRepository aiConfigRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<?> checkModels() {
        AiConfig config = aiConfigRepository.findAll().stream()
                .filter(AiConfig::getIsActive)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active config"));
        
        String url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + config.getApiKey();
        
        try {
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(objectMapper.readTree(response));
        } catch (Exception e) {
            log.error("Error fetching models", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
