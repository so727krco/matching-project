package com.matching.backmgr.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public class VectorUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static double[] parseVector(String json) {
        if (json == null || json.isEmpty()) return null;
        try {
            List<Double> list = objectMapper.readValue(json, new TypeReference<List<Double>>() {});
            double[] arr = new double[list.size()];
            for (int i = 0; i < list.size(); i++) {
                arr[i] = list.get(i);
            }
            return arr;
        } catch (Exception e) {
            return null;
        }
    }
    
    public static String toJson(double[] vector) {
        if (vector == null) return null;
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    public static double[] calculateWeightedAverage(java.util.Map<String, Integer> traitWeights, java.util.Map<String, double[]> referenceVectors) {
        if (traitWeights == null || traitWeights.isEmpty() || referenceVectors == null || referenceVectors.isEmpty()) {
            return null;
        }

        int vectorLength = -1;
        for (double[] v : referenceVectors.values()) {
            if (v != null) {
                vectorLength = v.length;
                break;
            }
        }
        if (vectorLength == -1) return null;

        double[] result = new double[vectorLength];
        double totalWeight = 0;

        for (java.util.Map.Entry<String, Integer> entry : traitWeights.entrySet()) {
            String keyword = entry.getKey();
            Integer weight = entry.getValue();
            double[] vector = referenceVectors.get(keyword);

            if (vector != null && vector.length == vectorLength && weight != null) {
                for (int i = 0; i < vectorLength; i++) {
                    result[i] += vector[i] * weight;
                }
                totalWeight += weight;
            }
        }

        if (totalWeight > 0) {
            for (int i = 0; i < vectorLength; i++) {
                result[i] /= totalWeight;
            }
            return result;
        }

        return null;
    }

    public static double calculateCosineSimilarity(double[] vectorA, double[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length != vectorB.length) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
