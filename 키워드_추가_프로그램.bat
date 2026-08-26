@echo off
chcp 65001 >nul
title AI 매칭 키워드 추가 프로그램
color 0A

:LOOP
cls
echo ===================================================
echo        AI 매칭 키워드 자동 추가 프로그램
echo ===================================================
echo.
echo 추가할 단어의 카테고리와 키워드를 입력해주세요.
echo (종료를 원하시면 이 창을 닫아주세요)
echo.

set CATEGORY=
set KEYWORD=

set /p CATEGORY="[1] 카테고리 입력 (예: MBTI, 취미, 성격): "
if "%CATEGORY%"=="" goto LOOP

set /p KEYWORD="[2] 키워드 입력 (예: ENTP, 클라이밍, 다정한): "
if "%KEYWORD%"=="" goto LOOP

echo.
echo ---------------------------------------------------
echo 카테고리: %CATEGORY%
echo 키워드  : %KEYWORD%
echo ---------------------------------------------------
echo.
echo 백엔드 서버와 통신하여 AI 벡터값을 계산하고 DB에 추가중입니다...
echo 잠시만 기다려주세요.
echo.

curl -X POST "http://localhost:8080/api/admin/embeddings/add" -d "category=%CATEGORY%" -d "keyword=%KEYWORD%"

echo.
echo.
echo ===================================================
echo 추가가 완료되었습니다! 
echo 계속해서 다른 단어를 추가하시려면 아무 키나 누르세요.
pause >nul
goto LOOP
