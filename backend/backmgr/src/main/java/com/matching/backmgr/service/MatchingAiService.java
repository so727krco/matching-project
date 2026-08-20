package com.matching.backmgr.service;

import java.util.List;
import java.util.Map;

public interface MatchingAiService {
    Map<String, Integer> extractTraitWeights(List<String> topics);
}
