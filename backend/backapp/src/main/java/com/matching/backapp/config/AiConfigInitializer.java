package com.matching.backapp.config;

import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.repository.AiConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AiConfigInitializer implements ApplicationRunner {

    private final AiConfigRepository aiConfigRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        aiConfigRepository.deleteAll();

        String realApiKey = System.getenv("GEMINI_API_KEY");
        if (realApiKey == null) realApiKey = "INSERT_API_KEY_HERE";

        // MATCHING_SEARCH config
        String matchingPrompt = "당신은 최고의 결혼정보회사(결정사) AI 매칭 전문가입니다. 매니저가 고객의 이상형 키워드(예: 뇌섹남, 영앤리치, 집순이)를 입력하면, 제공된 [추출 가능 194개 기준 단어 리스트] 안에서 문맥상 가치가 통하는 연관 단어들을 5~10개 사이로 골라주세요. 고른 단어들이 매니저의 키워드와 얼마나 강하게 연결되는지 0부터 100까지의 가중치 점수로 표현하세요. 신조어나 은어가 입력되어도 가장 비슷한 의미의 단어(예: 뇌섹남 -> 전문직, 지성인, 엘리트적인)를 똑똑하게 찾아야 합니다. 반드시 JSON 형식으로 {\"단어\": 점수, ...} 형태로 반환하세요. 마크다운 없이 순수 JSON 문자열만 반환하세요.";
        
        AiConfig matchingConfig = AiConfig.builder()
                .provider("GEMINI")
                .apiKey(realApiKey)
                .isActive(true)
                .systemPrompt(matchingPrompt)
                .usageType("MATCHING_SEARCH")
                .build();
        aiConfigRepository.save(matchingConfig);

        // MEMBER_PROFILING config
        String profilingPrompt = "당신은 결혼정보회사의 전문 프로파일러입니다.\n"
                + "제공된 회원의 프로필 텍스트를 분석하여, 다음 두 가지를 JSON 형식으로 반환하세요:\n"
                + "1. traits: 회원에게 가장 적합하고 두드러지는 특성(Trait) 10개~20개를 [추출 가능 기준 단어 리스트] 안에서만 골라, 특성명(키)과 가중치(0~100)(값)의 객체로 구성하세요.\n"
                + "2. analysisRemarks: 자기소개서 내용 중 모순되는 부분이 있는지, 어떤 회원을 매칭해주면 성공률이 높은지, 매칭 시 특별히 신경써야하거나 주의해야할 부분 등을 문자열로 상세하게 작성하세요.\n"
                + "응답은 반드시 아래 JSON 구조만을 가져야 하며, 다른 설명은 포함하지 마세요:\n"
                + "{\n"
                + "  \"traits\": {\"단어1\": 80, \"단어2\": 90},\n"
                + "  \"analysisRemarks\": \"분석 내용...\"\n"
                + "}";
        
        AiConfig profilingConfig = AiConfig.builder()
                .provider("GEMINI")
                .apiKey(realApiKey)
                .isActive(true)
                .systemPrompt(profilingPrompt)
                .usageType("MEMBER_PROFILING")
                .build();
        aiConfigRepository.save(profilingConfig);
    }
}
