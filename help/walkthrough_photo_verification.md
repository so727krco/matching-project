# AI 사진 및 외모 분석 검증 로직 구현

## 변경 목적 및 개요
기존에는 신규 회원을 등록할 때, 사진 업로드 시 가짜 타이머 로직을 이용해 '본인인증 완료' UI를 임시로 띄웠으며 AI 분석을 수행하지 않고 단순히 DB에 데이터를 밀어넣는 구조였습니다. 

이번 작업을 통해 회원 가입 시 **실제로 사용자가 올린 사진들을 Google Gemini Vision API로 전송**하여 사진의 정상 유무를 체크하고, 매칭에 필요한 '외모적 특성(30여개 카테고리)'을 추출하여 DB에 안전하게 보관하는 실질적인 멀티모달 분석 아키텍처를 완성했습니다.

## 주요 변경 및 구현 내용

### 1. 프론트엔드 (회원 등록 화면)
* **[수정] [MemberRegistration.tsx](file:///C:/Users/so727/matching-project/frontend/src/pages/MemberRegistration.tsx)**
  * **목업(Mock) 로직 제거**: 1.5초 타이머로 억지 성공/실패를 발생시키던 UI 상태 값을 완전히 삭제했습니다.
  * **Base64 이미지 인코딩**: 사용자가 올린 `File` 객체들을 `FileReader`를 이용해 Base64 텍스트로 인코딩한 뒤, `POST /api/members`에 JSON 형식(`imageUrl1 ~ 5`)으로 담아 보내도록 수정했습니다.
  * **로딩 오버레이 추가**: AI가 사진을 검증하는 데는 약 3초~5초 정도가 소요되므로, 폼을 제출할 때 화면 전체를 덮는 로딩 스피너 UI(`isSubmitting`)를 추가하여 사용자 경험(UX)을 개선했습니다.

### 2. 백엔드 (DTO 및 엔티티 수정)
* **[신규] [AiPhotoResult.java](file:///C:/Users/so727/matching-project/backend/backmgr/src/main/java/com/matching/backmgr/dto/AiPhotoResult.java)**
  * AI의 사진 분석 결과를 담을 전용 DTO 클래스입니다. 최종 통과 여부(`finalPassed`), 거절 혹은 통과 사유(`reason`), 추출된 외모 특성 점수(`appearanceTraits`)를 담습니다.
* **[수정] [Member.java](file:///C:/Users/so727/matching-project/backend/backmgr/src/main/java/com/matching/backmgr/entity/Member.java)**
  * Base64 인코딩된 문자열은 매우 길기 때문에(수십~수백 KB), 기본 `VARCHAR(255)` 크기의 `imageUrl` 컬럼에 삽입하려 하면 데이터 잘림(Truncation) 예외가 발생하여 서버가 뻗게 됩니다.
  * 따라서 `imageUrl1` ~ `imageUrl5` 필드에 `@Column(columnDefinition = "LONGTEXT")` 속성을 부여하여 대용량 이미지 텍스트를 안전하게 저장하도록 스키마를 업데이트했습니다.

### 3. 백엔드 (AI 서비스 및 로직 구현)
* **[수정] [MatchingAiService.java](file:///C:/Users/so727/matching-project/backend/backmgr/src/main/java/com/matching/backmgr/service/MatchingAiService.java)**
  * `verifyPhotosAndExtractTraits` 추상화 메서드를 선언하여 다형성을 보장했습니다.
* **[수정] [GeminiMatchingAiServiceImpl.java](file:///C:/Users/so727/matching-project/backend/backmgr/src/main/java/com/matching/backmgr/service/impl/GeminiMatchingAiServiceImpl.java)**
  * 업로드된 모든 이미지 텍스트에서 불필요한 메타 접두어(`data:image/jpeg;base64,`)를 제거한 뒤, Gemini 프롬프트의 `inlineData`로 첨부하여 Vision 멀티모달 분석을 요청합니다.
  * 194개의 특성을 모두 프롬프트에 제공할 시 발생하는 과다 토큰 비용을 최소화하기 위해, DB(`matching_trait_reference`)에서 `APPEARANCE`와 `LOOKS` 카테고리(약 30개)만 추려내어 AI에게 제공하도록 최적화했습니다.
* **[수정] [MemberService.java](file:///C:/Users/so727/matching-project/backend/backmgr/src/main/java/com/matching/backmgr/service/MemberService.java)**
  * `registerMember` 호출 시, 텍스트 프로파일링과 더불어 사진 검증을 순차적으로 수행합니다.
  * **저장 비차단 원칙 준수**: 사진 검증이 실패(`final_passed: false`)하더라도, 예외(Exception)를 던져 롤백하지 않습니다. 대신 `aiVerificationPassed` 컬럼을 `false`로 마킹하고, AI가 남긴 '실패 사유'를 기존 `aiRemarks` 문자열 상단에 추가 기록(Append)한 뒤 정상 저장합니다.
  * 분석으로 추출된 외모 특성은 기존 프로필(텍스트) 분석으로 도출된 성향 특성(Traits) Map과 병합되어 `MemberTrait` 테이블에 통합 저장됩니다.

## 검증 플랜
- 백엔드 앱을 재가동합니다.
- 프론트엔드에서 새로운 회원을 생성하고 인물 사진과 풍경 사진을 섞어서 등록해 봅니다.
- DB의 `member` 테이블에 `ai_verification_passed`가 실패로 마킹되고 `ai_remarks`에 AI의 판독 사유가 정상적으로 남는지 확인합니다.
- 정상 인물 사진을 넣었을 때는 외모 특성치가 `member_trait` 테이블에 성공적으로 추출되는지 확인합니다.
