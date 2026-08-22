@echo off
chcp 65001 >nul
echo ========================================================
echo        결혼정보회사 매칭 시스템 - 3000명 회원 대량 생성기
echo ========================================================
echo.
echo ⚠️ 주의사항:
echo 1. 기존의 모든 회원 데이터와 매칭 기록이 삭제됩니다!
echo 2. Gemini AI의 분석을 거치므로 완료까지 수 시간이 소요될 수 있습니다.
echo 3. 백엔드 서버(Spring Boot)가 현재 실행 중이어야 합니다.
echo.
echo 실행하시겠습니까? (창을 닫으면 취소됩니다)
pause

echo.
echo 생성을 시작합니다...
node batch_generate_members.js
pause
