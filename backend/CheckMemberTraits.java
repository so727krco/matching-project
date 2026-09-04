import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class CheckMemberTraits {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/matching_db?serverTimezone=Asia/Seoul&characterEncoding=UTF-8";
        String user = "root";
        String pass = "9621";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            try (PreparedStatement pstmt = conn.prepareStatement("SELECT member_id, own_vector, ideal_vector FROM member_trait LIMIT 5")) {
                ResultSet rs = pstmt.executeQuery();
                while (rs.next()) {
                    String own = rs.getString("own_vector");
                    String ideal = rs.getString("ideal_vector");
                    System.out.println(rs.getInt("member_id") + " | own: " + (own == null ? "null" : own.substring(0, Math.min(20, own.length()))) + " | ideal: " + (ideal == null ? "null" : ideal.substring(0, Math.min(20, ideal.length()))));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
