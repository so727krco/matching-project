package com.matching.backapp.config;

import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.repository.AiConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class InitData implements CommandLineRunner {

    private final AiConfigRepository aiConfigRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        String profilingPrompt = "당신은 데이팅앱의 프로필 AI 분석가입니다.\n" +
            "사용자가 작성한 텍스트를 읽고, 다음 두가지를 구분하여 JSON 형식으로 반환해주세요:\n" +
            "1. traits: 사용자의 '본인'의 성향, 관심사, 성격에 해당하는 키워드 10~20개를 [주어진 추출 가능 단어 리스트] 안에서만 골라 점수(0~100) 부여 반환.\n" +
            "2. idealTraits: 사용자가 원하는 '이상형'의 성향, 관심사, 성격에 해당하는 키워드 10~20개를 [주어진 추출 가능 단어 리스트] 안에서만 골라 점수(0~100) 부여 반환.\n" +
            "3. analysisRemarks: 사용자의 성향 및 이상형에 대한 종합 코멘트\n" +
            "JSON 예시:\n" +
            "{\n" +
            "  \"traits\": {\"단어1\": 80, \"단어2\": 90},\n" +
            "  \"idealTraits\": {\"단어3\": 80, \"단어4\": 90},\n" +
            "  \"analysisRemarks\": \"사용자 분석 결과...\"\n" +
            "}";

        java.util.Optional<AiConfig> profilingOpt = aiConfigRepository.findByIsActiveTrueAndUsageType("MEMBER_PROFILING");
        if (profilingOpt.isEmpty()) {
            AiConfig profilingConfig = AiConfig.builder()
                .provider("Google Gemini")
                .apiUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent")
                .apiKey("YOUR_API_KEY_HERE")
                .usageType("MEMBER_PROFILING")
                .systemPrompt(profilingPrompt)
                .isActive(true)
                .build();
            aiConfigRepository.save(profilingConfig);
        } else {
            AiConfig cfg = profilingOpt.get();
            cfg.setSystemPrompt(profilingPrompt);
            aiConfigRepository.save(cfg);
        }

        String weightPrompt = "당신은 매칭 전문가입니다.\n" +
            "사용자가 다음 검색어로 매칭 상대를 찾으려고 합니다: %s\n" +
            "이 검색어를 바탕으로 대상을 검색할 때, 후보자 '본인의 성격(own)'에 이 키워드가 있는 것이 중요한지, 아니면 후보자가 '원하는 이상형(ideal)'에 이 키워드가 있는 것이 중요한지 판단해주세요.\n" +
            "결과를 다음과 같이 JSON으로만 반환하세요: {\"ownWeight\": 0.6, \"idealWeight\": 0.4}";

        java.util.Optional<AiConfig> weightConfigOpt = aiConfigRepository.findByIsActiveTrueAndUsageType("MATCHING_WEIGHT");
        if (weightConfigOpt.isEmpty()) {
            AiConfig weightConfig = AiConfig.builder()
                .provider("Google Gemini")
                .apiUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent")
                .apiKey("YOUR_API_KEY_HERE")
                .usageType("MATCHING_WEIGHT")
                .systemPrompt(weightPrompt)
                .isActive(true)
                .build();
            aiConfigRepository.save(weightConfig);
        } else {
            AiConfig cfg = weightConfigOpt.get();
            cfg.setSystemPrompt(weightPrompt);
            aiConfigRepository.save(cfg);
        }
        
        if (aiConfigRepository.findByIsActiveTrueAndUsageType("EMBEDDING").isEmpty()) {
            AiConfig embeddingConfig = AiConfig.builder()
                .provider("Google Gemini")
                .apiUrl("https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent")
                .apiKey("YOUR_API_KEY_HERE")
                .usageType("EMBEDDING")
                .systemPrompt("")
                .isActive(true)
                .build();
            aiConfigRepository.save(embeddingConfig);
        }
    }
}
