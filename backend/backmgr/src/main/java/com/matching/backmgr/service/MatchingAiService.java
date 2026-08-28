package com.matching.backmgr.service;

import java.util.List;
import java.util.Map;
import com.matching.backmgr.dto.AiProfileResult;

import com.matching.backmgr.dto.AiPhotoResult;

import com.matching.backmgr.dto.SearchAnalysisResult;

public interface MatchingAiService {
    Map<String, Integer> extractTraitWeights(List<String> topics);
    SearchAnalysisResult analyzeSearchQuery(List<String> topics);
    AiProfileResult profileMemberTraits(String memberProfileText);
    AiPhotoResult verifyPhotosAndExtractTraits(List<String> base64Images);
    List<Double> getEmbedding(String text);
}
