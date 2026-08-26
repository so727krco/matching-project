@echo off
chcp 65001 >nul
setlocal

if "%~1"=="" (
    echo [ERROR] 카테고리를 입력해주세요.
    echo 사용법: add_keyword.bat "카테고리명" "키워드명"
    echo 예시: add_keyword.bat "MBTI" "ENTP"
    exit /b 1
)

if "%~2"=="" (
    echo [ERROR] 키워드를 입력해주세요.
    echo 사용법: add_keyword.bat "카테고리명" "키워드명"
    echo 예시: add_keyword.bat "MBTI" "ENTP"
    exit /b 1
)

set CATEGORY=%~1
set KEYWORD=%~2

echo ---------------------------------------------------
echo 카테고리: %CATEGORY%
echo 키워드: %KEYWORD%
echo ---------------------------------------------------
echo DB에 키워드를 추가하고 AI 벡터값을 계산하는 중입니다...

curl -X POST "http://localhost:8080/api/admin/embeddings/add" -d "category=%CATEGORY%" -d "keyword=%KEYWORD%"

echo.
echo ---------------------------------------------------
echo 처리가 완료되었습니다.
endlocal
