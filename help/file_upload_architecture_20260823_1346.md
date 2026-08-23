# 로컬 스토리지 기반 이미지 저장 방식 구조 변경 기획서

현재 Base64 문자열을 그대로 DB에 저장하던 방식에서 벗어나, 표준적인 클라우드 스토리지(S3) 아키텍처와 유사하게 동작하도록 로컬 파일 시스템을 활용하여 이미지 저장 구조를 변경합니다.

## User Review Required
> [!NOTE]
> 본 작업은 프론트엔드와 백엔드의 사진 저장 방식을 표준적인 형태로 탈바꿈하는 핵심 아키텍처 변경 작업입니다. S3와 같은 외부 저장소로 나중에 쉽게 교체할 수 있도록 기반을 다집니다.

## Proposed Changes

### 백엔드 (Backend)

#### [NEW] `FileUploadController.java`
- **역할**: 프론트엔드에서 전송한 사진 파일(`MultipartFile`)을 받아 로컬의 `uploads/` 디렉토리에 물리적 파일로 저장합니다.
- **반환값**: 저장된 파일에 접근할 수 있는 URL 경로(예: `/uploads/uuid-1234.jpg`) 리스트를 프론트엔드로 응답합니다.

#### [NEW / MODIFY] `WebConfig.java`
- **역할**: 프론트엔드에서 `<img src="http://localhost:8080/uploads/...">` 형태로 서버에 저장된 이미지를 불러올 수 있도록 정적 리소스 경로 매핑(Static Resource Handler)을 추가합니다.

#### [MODIFY] `MemberService.java`
- **역할**: `registerMember`에서 AI 프로파일링을 수행하기 위해 사진을 Gemini에 보낼 때, DB에 담긴 URL(`/uploads/...`)을 보고 로컬 디스크에서 해당 파일을 다시 읽어와 Base64로 인코딩한 뒤 AI 서버로 전송하도록 로직을 수정합니다.
- Base64 인코딩 과정은 철저히 메모리에서만 이루어지며 DB에는 오직 경로(URL)만 깔끔하게 저장됩니다.

#### [MODIFY] `Member.java`
- 기존에 임시로 설정했던 `@Column(columnDefinition = "LONGTEXT")` 속성을 원래대로 롤백하거나 제거합니다. 이제 긴 문자열이 들어오지 않고 짧은 경로 문자열만 들어오게 됩니다.

---

### 프론트엔드 (Frontend)

#### [MODIFY] `MemberRegistration.tsx`
- **폼 제출 로직 분리**:
  1. `가입 완료` 버튼을 누르면, 우선 사진들을 `FormData`에 담아 `POST /api/upload`로 전송합니다.
  2. 서버로부터 반환받은 물리적 파일 URL(경로)들을 응답받아 변수에 저장합니다.
  3. 반환받은 URL들을 `imageUrl1` ~ `imageUrl5`에 매핑하여 기존의 `POST /api/members` JSON 요청을 최종적으로 날립니다.

## Verification Plan

### Manual Verification
- 신규 회원을 등록할 때, 로컬 PC의 백엔드 폴더 내부에 `uploads/` 디렉토리가 생성되고 사진이 물리적으로 저장되는지 확인합니다.
- 회원 조회 시 엑스박스 없이 정상적으로 프로필 이미지가 출력되는지 확인합니다.
- AI 로직이 기존과 동일하게 업로드된 사진을 정상적으로 판독하여 결과를 마킹해주는지 로그를 통해 확인합니다.
