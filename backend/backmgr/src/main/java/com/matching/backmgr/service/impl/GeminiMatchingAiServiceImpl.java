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
    private final String embeddingUrl;
    private final String embeddingApiKey;
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

    @Override
    public com.matching.backmgr.dto.AiPhotoResult verifyPhotosAndExtractTraits(List<String> base64Images) {
        List<String> validImages = base64Images.stream()
                .filter(img -> img != null && !img.trim().isEmpty())
                .map(img -> {
                    if (img.contains(",")) {
                        return img.split(",")[1];
                    }
                    return img;
                })
                .collect(Collectors.toList());

        com.matching.backmgr.dto.AiPhotoResult result = new com.matching.backmgr.dto.AiPhotoResult();
        if (validImages.isEmpty()) {
            result.setFinalPassed(true);
            result.setReason("업로드된 사진이 없습니다.");
            result.setAppearanceTraits(new HashMap<>());
            return result;
        }

        List<String> appearanceTraits = traitRefRepository.findAll().stream()
                .filter(t -> "APPEARANCE".equalsIgnoreCase(t.getCategory()) || "LOOKS".equalsIgnoreCase(t.getCategory()))
                .map(MatchingTraitReference::getKeyword)
                .collect(Collectors.toList());

        String url = apiUrl + "?key=" + apiKey;

        String prompt = "You are an AI photo verification assistant. Analyze the following user profile photos.\n" +
                "1. For each photo, determine: is the face clearly visible? Is there only one person? Is the content safe (not NSFW)?\n" +
                "2. Across all photos, determine: are they all the same person?\n" +
                "3. Based on the photos, extract visual appearance traits from the following list and assign a score (0-100).\n" +
                "[Available Appearance Traits]: " + String.join(", ", appearanceTraits) + "\n\n" +
                "Respond ONLY with a JSON object in this exact format, with no markdown code blocks:\n" +
                "{\n" +
                "  \"final_passed\": true/false (true ONLY IF all photos have clear face, single person, safe, and ALL are the same person),\n" +
                "  \"reason\": \"If false, explain why in Korean (e.g., '2번째 사진의 이목구비가 불분명합니다', '동일인이 아닙니다'). If true, write '검증 완료'\",\n" +
                "  \"appearance_traits\": {\n" +
                "    \"trait1\": 80,\n" +
                "    \"trait2\": 90\n" +
                "  }\n" +
                "}";

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        List<Map<String, Object>> parts = new java.util.ArrayList<>();
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);

        for (String base64Img : validImages) {
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", "image/jpeg");
            inlineData.put("data", base64Img);
            
            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inlineData", inlineData);
            parts.add(imagePart);
        }

        contents.put("parts", parts);
        requestBody.put("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Requesting Gemini AI for Photo Verification ({} images)...", validImages.size());
            String response = restTemplate.postForObject(url, entity, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            String textResponse = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text").asText();
            
            textResponse = textResponse.replaceAll("(?s).*?```json\\s*", "").replaceAll("\\s*```.*", "");
            log.info("Photo Verification Result JSON: {}", textResponse);
            
            JsonNode jsonResult = objectMapper.readTree(textResponse);
            result.setFinalPassed(jsonResult.path("final_passed").asBoolean(false));
            result.setReason(jsonResult.path("reason").asText("Unknown reason"));
            
            Map<String, Integer> traitsMap = new HashMap<>();
            if (jsonResult.has("appearance_traits")) {
                jsonResult.get("appearance_traits").fields().forEachRemaining(entry -> {
                    traitsMap.put(entry.getKey(), entry.getValue().asInt());
                });
            }
            result.setAppearanceTraits(traitsMap);

        } catch (Exception e) {
            log.error("Failed to verify photos via AI", e);
            result.setFinalPassed(false);
            result.setReason("AI 검증 서버 오류가 발생했습니다.");
            result.setAppearanceTraits(new HashMap<>());
        }
        
        return result;
    }

    @Override
    public List<Double> getEmbedding(String text) {
        String finalUrl = embeddingUrl;
        if (!finalUrl.contains("key=")) {
            finalUrl = finalUrl + "?key=" + embeddingApiKey;
        }
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "models/gemini-embedding-2");
        
        Map<String, Object> content = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", text);
        content.put("parts", List.of(parts));
        requestBody.put("content", content);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Requesting Gemini Embedding API for text: {}", text);
            String response = restTemplate.postForObject(finalUrl, entity, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode valuesNode = rootNode.path("embedding").path("values");
            
            List<Double> embedding = new java.util.ArrayList<>();
            if (valuesNode.isArray()) {
                for (JsonNode val : valuesNode) {
                    embedding.add(val.asDouble());
                }
            }
            return embedding;
        } catch (Exception e) {
            log.error("Failed to fetch embedding from Gemini", e);
            return new java.util.ArrayList<>();
        }
    }
}
