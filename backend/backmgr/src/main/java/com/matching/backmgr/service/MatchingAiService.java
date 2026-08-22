package com.matching.backmgr.service;

import java.util.List;
import java.util.Map;
import com.matching.backmgr.dto.AiProfileResult;

public interface MatchingAiService {
    Map<String, Integer> extractTraitWeights(List<String> topics);
    AiProfileResult profileMemberTraits(String memberProfileText);
}
