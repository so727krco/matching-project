package com.matching.backmgr.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matching.backmgr.entity.MatchingTraitReference;
import com.matching.backmgr.repository.MatchingTraitReferenceRepository;
import com.matching.backmgr.service.MatchingAiService;
import com.matching.backmgr.dto.AiProfileResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
public class GeminiMatchingAiServiceImpl implements MatchingAiService {

    private final String apiUrl;
    private final String apiKey;
    private final String systemPrompt;
    private final MatchingTraitReferenceRepository traitRefRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Map<String, Integer> extractTraitWeights(List<String> topics) {
        // We reuse the generic json map logic for simple tasks, but here we can just map it directly.
        // It's not the new format.
        String url = apiUrl + "?key=" + apiKey;
        String fullPrompt = systemPrompt + "\n\n[Topics]: " + topics.toString();
        // Since the generic method now parses the new object, we need a separate logic for extractTraitWeights if needed.
        // But for this demo, extractTraitWeights isn't the one being changed.
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", fullPrompt);
        contents.put("parts", List.of(parts));
        requestBody.put("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        Map<String, Integer> resultWeights = new HashMap<>();
        try {
            String response = restTemplate.postForObject(url, entity, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            String textResponse = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            textResponse = textResponse.replaceAll("(?s).*?```json\\s*", "").replaceAll("\\s*```.*", "");
            JsonNode jsonResult = objectMapper.readTree(textResponse);
            jsonResult.fields().forEachRemaining(entry -> {
                resultWeights.put(entry.getKey(), entry.getValue().asInt());
            });
        } catch (Exception e) {
            log.error("Error", e);
        }
        return resultWeights;
    }

    @Override
    public AiProfileResult profileMemberTraits(String memberProfileText) {
        List<String> allTraits = traitRefRepository.findAll().stream()
                .map(MatchingTraitReference::getKeyword)
                .collect(Collectors.toList());

        String url = apiUrl + "?key=" + apiKey;

        String fullPrompt = systemPrompt + "\n\n"
                + "[분석할 내용]: " + memberProfileText + "\n\n"
                + "[추출 가능 기준 단어 리스트]:\n" + String.join(", ", allTraits);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", fullPrompt);
        contents.put("parts", List.of(parts));
        requestBody.put("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        AiProfileResult result = new AiProfileResult();
        JsonNode rootNode = null;
        try {
            log.info("Requesting Gemini API (member profiling)...");
            String response = restTemplate.postForObject(url, entity, String.class);
            rootNode = objectMapper.readTree(response);
            
            String textResponse = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text").asText();
            
            textResponse = textResponse.replaceAll("(?s).*?```json\\s*", "").replaceAll("\\s*```.*", "");
            log.info("Received raw JSON from Gemini: {}", textResponse);

            JsonNode jsonResult = objectMapper.readTree(textResponse);
            
            Map<String, Integer> resultWeights = new HashMap<>();
            if (jsonResult.has("traits")) {
                jsonResult.get("traits").fields().forEachRemaining(entry -> {
                    resultWeights.put(entry.getKey(), entry.getValue().asInt());
                });
            } else {
                jsonResult.fields().forEachRemaining(entry -> {
                    if (!entry.getKey().equals("analysisRemarks") && entry.getValue().isInt()) {
                        resultWeights.put(entry.getKey(), entry.getValue().asInt());
                    }
                });
            }
            
            result.setTraits(resultWeights);
            
            if (jsonResult.has("analysisRemarks")) {
                result.setAnalysisRemarks(jsonResult.get("analysisRemarks").asText());
            } else {
                result.setAnalysisRemarks("특이사항 없음.");
            }

        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            log.error("Gemini API Rate Limit Exceeded (429)");
            throw new RuntimeException("GEMINI_RATE_LIMIT_EXCEEDED");
        } catch (Exception e) {
            log.error("Failed to parse Gemini response. textResponse: " + (rootNode != null ? rootNode.toString() : "null"), e);
            throw new RuntimeException("AI 분석 중 오류가 발생했습니다. (Safety 필터 차단 또는 응답 오류)");
        }

        return result;
    }
}
