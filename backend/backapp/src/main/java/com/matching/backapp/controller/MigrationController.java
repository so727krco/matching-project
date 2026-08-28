package com.matching.backapp.controller;

import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.entity.Member;
import com.matching.backmgr.repository.AiConfigRepository;
import com.matching.backmgr.repository.MemberRepository;
import com.matching.backmgr.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/admin/migrations")
@RequiredArgsConstructor
public class MigrationController {
    private final AiConfigRepository aiConfigRepository;
    private final MemberRepository memberRepository;
    private final MemberService memberService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    
    @PostMapping("/split-traits")
    public String splitTraits() {
        try {
            jdbcTemplate.execute("ALTER TABLE member_trait MODIFY COLUMN own_vector LONGTEXT");
            jdbcTemplate.execute("ALTER TABLE member_trait MODIFY COLUMN ideal_vector LONGTEXT");
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        AiConfig config = aiConfigRepository.findByIsActiveTrueAndUsageType("MEMBER_PROFILING").orElse(null);
        
        // 1. Ensure MATCHING_SEARCH and EMBEDDING exist
        if (aiConfigRepository.findByIsActiveTrueAndUsageType("MATCHING_SEARCH").isEmpty()) {
            AiConfig searchConfig = AiConfig.builder()
                .provider(config != null ? config.getProvider() : "Google Gemini")
                .apiUrl(config != null ? config.getApiUrl() : "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent")
                .apiKey(config != null ? config.getApiKey() : "API_KEY_HERE")
                .usageType("MATCHING_SEARCH")
                .systemPrompt("당신은 매칭 전문가입니다.")
                .isActive(true)
                .build();
            aiConfigRepository.save(searchConfig);
        }
        
        if (aiConfigRepository.findByIsActiveTrueAndUsageType("EMBEDDING").isEmpty()) {
            AiConfig embeddingConfig = AiConfig.builder()
                .provider("Google Gemini")
                .apiUrl("https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent")
                .apiKey(config != null ? config.getApiKey() : "API_KEY_HERE")
                .usageType("EMBEDDING")
                .systemPrompt("")
                .isActive(true)
                .build();
            aiConfigRepository.save(embeddingConfig);
        }
        
        // 2. Reprofile all members
        List<Member> members = memberRepository.findAll();
        int count = 0;
        for (Member m : members) {
            try {
                memberService.reprofileMemberViaAi(m.getId());
                count++;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        return "Updated config and reprofiled " + count + " members.";
    }
}
