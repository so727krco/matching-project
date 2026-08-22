package com.matching.backmgr.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matching.backmgr.entity.MatchingTraitReference;
import com.matching.backmgr.repository.MatchingTraitReferenceRepository;
import com.matching.backmgr.service.MatchingAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
public class GeminiMatchingAiServiceImpl implements MatchingAiService {

    private final String apiKey;
    private final String systemPrompt;
    private final MatchingTraitReferenceRepository traitRefRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Map<String, Integer> extractTraitWeights(List<String> topics) {
        List<String> allTraits = traitRefRepository.findAll().stream()
                .map(MatchingTraitReference::getKeyword)
                .collect(Collectors.toList());

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + apiKey;

        String prompt = systemPrompt + "\n\n"
                + "[사용자 입력 키워드]: " + String.join(", ", topics) + "\n\n"
                + "[추출 가능 기준 단어 리스트(150개)]:\n" + String.join(", ", allTraits);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", prompt);
        contents.put("parts", List.of(parts));
        requestBody.put("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Map<String, Integer> resultWeights = new HashMap<>();
        try {
            String response = restTemplate.postForObject(url, entity, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            
            // Navigate Gemini's response JSON
            String textResponse = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text").asText();
            
            // The AI might wrap JSON in ```json ... ``` blocks
            textResponse = textResponse.replaceAll("(?s).*?```json\\s*", "").replaceAll("\\s*```.*", "");

            JsonNode jsonResult = objectMapper.readTree(textResponse);
            jsonResult.fields().forEachRemaining(entry -> {
                resultWeights.put(entry.getKey(), entry.getValue().asInt());
            });

        } catch (Exception e) {
            log.error("Failed to parse Gemini response: ", e);
        }

        return resultWeights;
    }
}
