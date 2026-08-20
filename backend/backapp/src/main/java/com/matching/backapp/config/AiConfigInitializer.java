package com.matching.backapp.config;

import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.repository.AiConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AiConfigInitializer implements ApplicationRunner {

    private final AiConfigRepository aiConfigRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (aiConfigRepository.count() == 0) {
            AiConfig mockConfig = AiConfig.builder()
                    .provider("MOCK")
                    .apiKey("")
                    .isActive(true)
                    .systemPrompt("Default Mock Prompt")
                    .build();
            aiConfigRepository.save(mockConfig);

            String geminiPrompt = "당신은 매칭 데이터 변환 전문가입니다. 사용자가 입력한 주제어 키워드 배열을 보고, 제공된 150개의 [추출 가능 기준 단어 리스트] 내에서 가장 연관성 있는 단어들을 5개~10개 사이로 골라주세요. 고른 단어들이 사용자 키워드와 얼마나 강하게 연결되는지 0부터 100까지의 가중치로 표현하세요. 반드시 JSON 형식으로 {\"단어\": 점수, ...} 형태만 반환하세요. 마크다운 기호 없이 순수 JSON 문자열만 반환하세요.";
            AiConfig geminiConfig = AiConfig.builder()
                    .provider("GEMINI")
                    .apiKey("YOUR_GEMINI_API_KEY_HERE")
                    .isActive(false)
                    .systemPrompt(geminiPrompt)
                    .build();
            aiConfigRepository.save(geminiConfig);
        }
    }
}
