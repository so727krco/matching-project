package com.matching.backapp.config;

import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.repository.AiConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AiConfigInitializer implements ApplicationRunner {

    private final AiConfigRepository aiConfigRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        // Disable MOCK
        Optional<AiConfig> mockConfigOpt = aiConfigRepository.findByProvider("MOCK");
        if (mockConfigOpt.isPresent()) {
            AiConfig mock = mockConfigOpt.get();
            mock.setIsActive(false);
            aiConfigRepository.save(mock);
        } else {
            AiConfig mockConfig = AiConfig.builder()
                    .provider("MOCK")
                    .apiKey("DUMMY")
                    .isActive(false)
                    .systemPrompt("Default Mock Prompt")
                    .build();
            aiConfigRepository.save(mockConfig);
        }

        // Set GEMINI as active and inject real key
        String realApiKey = "YOUR_GEMINI_API_KEY_HERE"; // We will inject this via JS string replacement below
        String geminiPrompt = "당신은 최고급 결혼정보회사(결정사)의 AI 매칭 전문가입니다. 매니저가 고객의 이상형 키워드(예: 뇌섹남, 영앤리치, 집순이)를 입력하면, 제공된 [추출 가능 194개 기준 단어 리스트] 안에서 문맥과 가치관 연관성이 높은 단어들을 5개~10개 사이로 골라주세요. 고른 단어들이 매니저의 키워드와 얼마나 강하게 연결되는지 0부터 100까지의 가중치 점수로 표현하세요. 신조어나 은어가 입력되어도 가장 비슷한 의미의 단어(예: 뇌섹남 -> 전문직, 지적인, 논리적인)를 똑똑하게 찾아야 합니다. 반드시 JSON 형식으로 {\"단어\": 점수, ...} 형태로 반환하세요. 마크다운 없이 순수 JSON 문자열만 반환하세요.";
        
        Optional<AiConfig> geminiConfigOpt = aiConfigRepository.findByProvider("GEMINI");
        if (geminiConfigOpt.isPresent()) {
            AiConfig gemini = geminiConfigOpt.get();
            gemini.setApiKey(realApiKey);
            gemini.setSystemPrompt(geminiPrompt);
            gemini.setIsActive(true);
            aiConfigRepository.save(gemini);
        } else {
            AiConfig geminiConfig = AiConfig.builder()
                    .provider("GEMINI")
                    .apiKey(realApiKey)
                    .isActive(true)
                    .systemPrompt(geminiPrompt)
                    .build();
            aiConfigRepository.save(geminiConfig);
        }
    }
}
