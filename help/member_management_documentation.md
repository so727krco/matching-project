# 회원 관리 기능 문서 (등록 및 조회)

본 문서는 매칭 시스템 프로젝트에서 지금까지 구현된 회원 등록(Registration) 및 회원 조회(Inquiry) 기능의 스펙, 구현 방식, 그리고 주요 로직을 정리한 문서입니다.

---

## 1. 회원 등록 (Member Registration)

매니저가 새로운 회원의 프로필 정보를 입력하여 시스템에 등록하는 기능입니다. 데이터 무결성을 위해 여러 비즈니스 검증 로직이 포함되어 있습니다.

### 1.1 주요 스펙 및 필드
*   API Endpoint: `POST /api/members`
*   엔티티 (`Member`) 주요 필드:
    *   `name` (이름), `gender` (성별, M/F), `age` (나이), `height` (키), `job` (직업)
    *   `salary` (연소득, 숫자형 `Integer`로 변경됨)
    *   `phoneNumber` (휴대폰 번호), `kakaoId` (카카오톡 ID)
    *   `hobbies` (취미), `idealType` (이상형), `introduction` (자기소개), `remarks` (주의사항)
    *   `imageUrl1` ~ `imageUrl5` (최대 5장의 사진 업로드 경로 저장 컬럼)
    *   `manager_id` (회원을 담당하는 매니저 정보 매핑)

### 1.2 핵심 비즈니스 로직 (Service Layer)
*   연락처 필수 조건: `phoneNumber` 또는 `kakaoId` 둘 중 하나는 반드시 입력되어야 합니다. 둘 다 없는 경우 예외(`IllegalArgumentException`)가 발생합니다.
*   담당 매니저 매핑: 로그인한 매니저의 이름 혹은 사번을 기반으로 `Manager` 엔티티를 조회한 뒤, 회원의 담당 매니저로 자동 설정합니다.

### 1.3 프론트엔드 연동 (`MemberRegistration.tsx`)
*   React를 사용하여 입력 폼을 구성했습니다.
*   숫자형 필드인 나이(age)와 연소득(income)은 전송 시 `parseInt`를 통해 정수형으로 캐스팅되어 안전하게 서버로 전송됩니다.

---

## 2. 회원 조회 (Member Inquiry)

매니저가 조건에 맞는 회원들을 검색하고 리스트업하며, 리스트에서 클릭하여 상세 정보를 열람할 수 있는 기능입니다.

### 2.1 동적 검색 (QueryDSL)
복합적인 다중 조건 검색을 지원하기 위해 Spring Data JPA와 QueryDSL을 도입했습니다.

*   API Endpoint: `GET /api/members/search`
*   DTO (`MemberSearchCondition`):
    *   `name` (이름 포함 검색)
    *   `gender` (성별 완전 일치 검색)
    *   `minAge`, `maxAge` (나이 범위 검색)
    *   `minSalary` (최소 연소득 이상 검색)
    *   `managerEmpNo` (담당 매니저의 사번 완전 일치 검색)
*   구조적 설계:
    *   `MemberRepositoryCustom` 인터페이스 선언
    *   `MemberRepositoryCustomImpl` 에서 `JPAQueryFactory`를 사용하여 조건(BooleanExpression)이 존재하는 경우에만 `WHERE` 절을 동적으로 생성하는 동적 쿼리 구현.
    *   `MemberRepository`가 Custom Repository를 다중 상속하여 Controller/Service에서는 기본 JPA Repository처럼 사용.

### 2.2 프론트엔드 연동 (`MemberInquiry.tsx`)
*   기존 LocalStorage 모킹 데이터를 걷어내고, 실제 Backend `/api/members/search` 엔드포인트와 연동했습니다.
*   `searchFilters` 상태를 쿼리 파라미터(Query String)로 변환하여 서버에 `fetch` 요청을 보냅니다.
*   UI 통일성: 담당 매니저 사번 검색 입력 필드를 포함하여 모든 입력 필드의 UI 템플릿(Tailwind CSS `form-group` 등)을 통일했습니다.
*   상세 조회: 조회된 리스트의 회원을 클릭하면 기존에 설정된 우측 패널(혹은 모달) 뷰어에 백엔드에서 내려온 프로필 정보(연소득, 취미, 자기소개, 담당 매니저 사번 등)가 맵핑되어 표시됩니다.

## 3. 회원 등록 시 AI 프로파일링 (AI Profiling)

최근 업데이트를 통해 회원 등록 시 **AI(Gemini)가 회원의 프로필 텍스트를 분석하여 성향 및 종합 의견을 추출하고 저장하는 기능**이 추가되었습니다.

### 3.1 AI 프롬프트 분리 및 설정 (`ai_config` 테이블)
* 기존 소스 코드 내부에 하드코딩되어 있던 AI 지시사항(프롬프트)을 `ai_config` 테이블로 분리했습니다.
* `usage_type` 컬럼을 추가하여 각 설정값이 어떤 상황에서 쓰이는지 구분합니다.
    * `MEMBER_PROFILING`: 신규 회원 등록 시 성향 및 의견 분석용 프롬프트
    * `MATCHING_SEARCH`: 검색 시 키워드 연관성 가중치 추출용 프롬프트

### 3.2 AI 분석 로직 및 데이터 저장 (`GeminiMatchingAiServiceImpl`)
* 회원이 등록되는 시점(`MemberService.createMember()`)에 회원의 자기소개서(`introduction`)와 코멘트(`remarks`)가 AI에게 전달됩니다.
* AI는 `MEMBER_PROFILING` 프롬프트의 지시에 따라 두 가지 데이터를 JSON 형태로 반환합니다:
    1. **`traits` (성향 키워드 및 가중치)**: 정해진 194개 기준 단어 중에서 10~20개를 선정하고, 0~100 사이의 가중치를 부여합니다. 이 데이터는 `member_trait` 테이블에 JSON 형태로 저장됩니다.
    2. **`analysisRemarks` (AI 종합 분석 의견)**: 자기소개서 내용 중 모순되는 부분, 매칭 추천 대상, 매칭 시 주의사항(레드플래그 등)을 장문의 텍스트로 작성합니다. 이 텍스트는 `Member` 테이블의 `ai_remarks` 컬럼에 저장됩니다.

### 3.3 프론트엔드 연동 및 UI 업데이트 (`MemberInquiry.tsx`)
* 회원 상세 조회 창의 '이름/나이' 하단에 `AI성향분석` 버튼을 추가했습니다.
* 해당 버튼을 클릭 시 `GET /api/members/{id}/traits` 엔드포인트를 호출하여 `member_trait` 테이블에 저장된 성향 키워드 및 가중치를 가져옵니다.
* 화면에는 가중치가 매겨진 **성향 단어 리스트**와 함께, 백엔드로부터 전달받은 **AI 종합 분석 의견 (`aiRemarks`)** 텍스트가 동시에 표시됩니다.
* 데이터가 비어있을 시 표시되던 임시 더미 텍스트(예: 연락처 '010-1234-5678')들을 실제 데이터가 없을 시 '정보 없음'으로 표시되도록 일괄 개선하였습니다.
