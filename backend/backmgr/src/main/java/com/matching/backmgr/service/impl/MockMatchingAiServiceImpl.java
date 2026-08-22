package com.matching.backmgr.service.impl;

import com.matching.backmgr.dto.AiProfileResult;
import com.matching.backmgr.service.MatchingAiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MockMatchingAiServiceImpl implements MatchingAiService {

    @Override
    public Map<String, Integer> extractTraitWeights(List<String> topics) {
        log.info("Mock AI is extracting trait weights for topics: {}", topics);
        Map<String, Integer> dummyWeights = new HashMap<>();
        dummyWeights.put("활발한", 85);
        dummyWeights.put("외향적인", 90);
        return dummyWeights;
    }

    @Override
    public AiProfileResult profileMemberTraits(String memberProfileText) {
        log.info("Mock AI is profiling member text: {}", memberProfileText);
        AiProfileResult result = new AiProfileResult();
        Map<String, Integer> dummyTraits = new HashMap<>();
        dummyTraits.put("다정다감", 80);
        dummyTraits.put("유머러스한", 70);
        dummyTraits.put("책임감있는", 95);
        result.setTraits(dummyTraits);
        result.setAnalysisRemarks("모순 없음. 외향적이고 안정된 직장을 가진 분과 매칭 추천. 매칭 시 유머 코드 주의.");
        return result;
    }
}
