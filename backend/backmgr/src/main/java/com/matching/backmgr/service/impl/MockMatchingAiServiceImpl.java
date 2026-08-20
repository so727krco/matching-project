package com.matching.backmgr.service.impl;

import com.matching.backmgr.entity.MatchingTraitReference;
import com.matching.backmgr.repository.MatchingTraitReferenceRepository;
import com.matching.backmgr.service.MatchingAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MockMatchingAiServiceImpl implements MatchingAiService {

    private final MatchingTraitReferenceRepository traitRefRepository;

    @Override
    public Map<String, Integer> extractTraitWeights(List<String> topics) {
        // In a real scenario, we send 'topics' and 'reference list' to GPT-4o/Gemini
        // and parse the JSON response. Here, we mock it by picking random traits 
        // related to the references.
        
        List<MatchingTraitReference> allTraits = traitRefRepository.findAll();
        Map<String, Integer> resultWeights = new HashMap<>();
        
        if (allTraits.isEmpty()) return resultWeights;

        Random random = new Random();
        
        // Let's pretend the AI picked 5-8 relevant traits based on the 3 topics
        int targetTraitCount = 5 + random.nextInt(4);
        for(int i=0; i<targetTraitCount; i++) {
            MatchingTraitReference picked = allTraits.get(random.nextInt(allTraits.size()));
            // Give a weight between 50 and 100 for these target keywords
            resultWeights.put(picked.getKeyword(), 50 + random.nextInt(51));
        }

        return resultWeights;
    }
}
