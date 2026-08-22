package com.matching.backapp.config;

import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.repository.AiConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AiConfigInitializer implements ApplicationRunner {

    private final AiConfigRepository aiConfigRepository;

    private String readPromptFromFile(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            return "Failed to load prompt from " + path;
        }
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        String realApiKey = System.getenv("GEMINI_API_KEY");
        if (realApiKey == null) realApiKey = "INSERT_API_KEY_HERE";

        // MATCHING_SEARCH config - DB에 없을 때만 초기값 세팅
        Optional<AiConfig> matchingOpt = aiConfigRepository.findByIsActiveTrueAndUsageType("MATCHING_SEARCH");
        if (matchingOpt.isEmpty()) {
            String matchingPrompt = readPromptFromFile("prompts/matching_search.txt");
            
            AiConfig matchingConfig = AiConfig.builder()
                    .provider("GEMINI")
                    .apiKey(realApiKey)
                    .isActive(true)
                    .systemPrompt(matchingPrompt)
                    .usageType("MATCHING_SEARCH")
                    .build();
            aiConfigRepository.save(matchingConfig);
        }

        // MEMBER_PROFILING config - DB에 없을 때만 초기값 세팅
        Optional<AiConfig> profilingOpt = aiConfigRepository.findByIsActiveTrueAndUsageType("MEMBER_PROFILING");
        if (profilingOpt.isEmpty()) {
            String profilingPrompt = readPromptFromFile("prompts/member_profiling.txt");
            
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
}
