import com.matching.backmgr.service.impl.GeminiMatchingAiServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Arrays;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class TestAi {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/matching_db?serverTimezone=Asia/Seoul&characterEncoding=UTF-8";
        String user = "root";
        String pass = "9621";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            String apiKey = null;
            String systemPrompt = null;
            try (PreparedStatement pstmt = conn.prepareStatement("SELECT api_key, system_prompt FROM ai_config WHERE usage_type = 'MATCHING_WEIGHT'")) {
                ResultSet rs = pstmt.executeQuery();
                if (rs.next()) {
                    apiKey = rs.getString("api_key");
                    systemPrompt = rs.getString("system_prompt");
                }
            }
            
            System.out.println("WEIGHT API KEY: " + apiKey);
            System.out.println("WEIGHT PROMPT: " + systemPrompt);
            
            GeminiMatchingAiServiceImpl weightAi = new GeminiMatchingAiServiceImpl(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
                apiKey,
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
                apiKey,
                systemPrompt,
                null,
                new ObjectMapper()
            );
            
            System.out.println("CALLING analyzeSearchQuery...");
            com.matching.backmgr.dto.SearchAnalysisResult res = weightAi.analyzeSearchQuery(Arrays.asList("고양이", "강아지", "책"));
            System.out.println("ownWeight: " + res.getOwnWeight());
            System.out.println("idealWeight: " + res.getIdealWeight());
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
