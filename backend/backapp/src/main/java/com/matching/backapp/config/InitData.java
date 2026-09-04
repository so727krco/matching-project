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
        String profilingPrompt = "?¹ì‹ ?€ ?°ì´?…ì•±???„ë¡œ??AI ë¶„ì„ê°€?…ë‹ˆ??\n" +
            "?¬ìš©?ê? ?‘ì„±???ìŠ¤?¸ë? ?½ê³ , ?¤ìŒ ?ê?ì§€ë¥?êµ¬ë¶„?˜ì—¬ JSON ?•ì‹?¼ë¡œ ë°˜í™˜?´ì£¼?¸ìš”:\n" +
            "1. traits: ?¬ìš©?ì˜ 'ë³¸ì¸'???±í–¥, ê´€?¬ì‚¬, ?±ê²©???´ë‹¹?˜ëŠ” ?¤ì›Œ??10~20ê°œë? [ì£¼ì–´ì§?ì¶”ì¶œ ê°€???¨ì–´ ë¦¬ìŠ¤?? ?ˆì—?œë§Œ ê³¨ë¼ ?ìˆ˜(0~100) ë¶€??ë°˜í™˜.\n" +
            "2. idealTraits: ?¬ìš©?ê? ?í•˜??'?´ìƒ?????±í–¥, ê´€?¬ì‚¬, ?±ê²©???´ë‹¹?˜ëŠ” ?¤ì›Œ??10~20ê°œë? [ì£¼ì–´ì§?ì¶”ì¶œ ê°€???¨ì–´ ë¦¬ìŠ¤?? ?ˆì—?œë§Œ ê³¨ë¼ ?ìˆ˜(0~100) ë¶€??ë°˜í™˜.\n" +
            "3. analysisRemarks: ?¬ìš©?ì˜ ?±í–¥ ë°??´ìƒ?•ì— ?€??ì¢…í•© ì½”ë©˜??n" +
            "JSON ?ˆì‹œ:\n" +
            "{\n" +
            "  \"traits\": {\"?¨ì–´1\": 80, \"?¨ì–´2\": 90},\n" +
            "  \"idealTraits\": {\"?¨ì–´3\": 80, \"?¨ì–´4\": 90},\n" +
            "  \"analysisRemarks\": \"?¬ìš©??ë¶„ì„ ê²°ê³¼...\"\n" +
            "}";

        java.util.Optional<AiConfig> profilingOpt = aiConfigRepository.findByIsActiveTrueAndUsageType("MEMBER_PROFILING");
        if (profilingOpt.isEmpty()) {
            AiConfig profilingConfig = AiConfig.builder()
                .provider("Google Gemini")
                .apiUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent")
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

        String weightPrompt = "?¹ì‹ ?€ ë§¤ì¹­ ?„ë¬¸ê°€?…ë‹ˆ??\n" +
            "?¬ìš©?ê? ?¤ìŒ ê²€?‰ì–´ë¡?ë§¤ì¹­ ?ë?ë¥?ì°¾ìœ¼?¤ê³  ?©ë‹ˆ?? %s\n" +
            "??ê²€?‰ì–´ë¥?ë°”íƒ•?¼ë¡œ ?€?ì„ ê²€?‰í•  ?? ?„ë³´??'ë³¸ì¸???±ê²©(own)'?????¤ì›Œ?œê? ?ˆëŠ” ê²ƒì´ ì¤‘ìš”?œì?, ?„ë‹ˆë©??„ë³´?ê? '?í•˜???´ìƒ??ideal)'?????¤ì›Œ?œê? ?ˆëŠ” ê²ƒì´ ì¤‘ìš”?œì? ?ë‹¨?´ì£¼?¸ìš”.\n" +
            "ê²°ê³¼ë¥??¤ìŒê³?ê°™ì´ JSON?¼ë¡œë§?ë°˜í™˜?˜ì„¸?? {\"ownWeight\": 0.6, \"idealWeight\": 0.4}";

        java.util.Optional<AiConfig> weightConfigOpt = aiConfigRepository.findByIsActiveTrueAndUsageType("MATCHING_WEIGHT");
        if (weightConfigOpt.isEmpty()) {
            AiConfig weightConfig = AiConfig.builder()
                .provider("Google Gemini")
                .apiUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent")
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
