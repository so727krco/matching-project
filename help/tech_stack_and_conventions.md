# 프로젝트 기술 스택 및 코딩 컨벤션 명세서

본 문서는 현재 매칭 프로젝트의 프론트엔드(Frontend)와 백엔드(Backend)에서 사용 중인 주요 기술 스택과 아키텍처, 그리고 코드 작성 양식(Convention)을 정리한 문서입니다.

---

## 1. 기술 스택 (Tech Stack)

### 1.1 프론트엔드 (Frontend)
- **핵심 라이브러리:** React 18
- **언어:** TypeScript (타입 안정성 확보)
- **빌드 도구:** Vite (빠른 HMR 및 빌드 속도)
- **라우팅:** `react-router-dom` (SPA 라우팅)
- **스타일링:** 순수 CSS (`index.css`)
  - CSS 변수(CSS Variables)를 활용하여 테마(색상, 폰트 크기, 간격 등)를 중앙 통제
  - 무거운 CSS 프레임워크(Tailwind, Bootstrap 등) 없이 가볍고 일관된 유틸리티 클래스 위주로 작성
- **아이콘:** `lucide-react` (가볍고 깔끔한 SVG 아이콘)
- **상태 관리:** 
  - 로컬 상태: React 기본 Hook (`useState`, `useEffect`)
  - 전역 상태(팝업 등): React Context API (`PopupContext` 등)

### 1.2 백엔드 (Backend)
- **핵심 프레임워크:** Spring Boot 3.3.0
- **언어:** Java 17 (또는 21, 최신 LTS 기능 활용)
- **빌드 도구:** Gradle
- **프로젝트 구조:** 멀티 모듈 (Multi-module) 방식
  - `:backapp`: API 컨트롤러, DTO, 서버 실행 및 설정 계층
  - `:backmgr`: 엔티티(Entity), 서비스(Service), 레포지토리(Repository) 등 핵심 비즈니스 로직 계층
- **데이터베이스:** MySQL 8.4
- **ORM / 데이터 접근:**
  - Spring Data JPA (Hibernate)
  - `ddl-auto: update`를 통해 자바 엔티티 기반 자동 테이블 구조 관리
- **보안 / 암호화:**
  - 무거운 Spring Security 대신, 커스텀 유틸리티(`SecurityUtil`)를 활용하여 SHA-256 단방향 암호화 및 마스킹 처리 적용

---

## 2. 아키텍처 및 코딩 양식 (Architecture & Conventions)

### 2.1 프론트엔드 폴더 구조 및 양식
- `src/pages/`: 각 화면(Screen) 단위의 컴포넌트가 위치합니다. (예: `LoginScreen.tsx`, `SignupScreen.tsx`)
- `src/contexts/`: 앱 전역에서 사용할 상태를 관리합니다. (예: 팝업 알림 관리를 위한 `PopupContext.tsx`)
- `src/index.css`: 공통 스타일 토큰과 유틸리티 클래스들이 정의되어 있습니다.

**코딩 컨벤션:**
1. **함수형 컴포넌트:** 모든 컴포넌트는 화살표 함수 또는 `export default function` 형태의 함수형 컴포넌트로 작성합니다.
2. **API 통신:** `fetch` API를 사용하여 백엔드(`http://localhost:8080/api/...`)와 직접 JSON 형태로 통신합니다.
3. **에러 처리:** 백엔드에서 반환된 HTTP 상태 코드(`response.ok`)를 확인하고, 에러 시 텍스트를 읽어 `showAlert`를 통해 사용자에게 에러 메시지를 띄웁니다.
4. **스타일 클래스:** `.form-group`, `.form-input`, `.btn-primary` 등 미리 정의된 유틸리티 클래스를 조합하여 일관된 디자인을 유지합니다.

### 2.2 백엔드 아키텍처 (Layered Architecture)
백엔드는 명확한 역할 분담을 위해 **계층형 아키텍처** 패턴을 사용합니다.

- **Controller (`backapp/controller/`)**
  - **역할:** HTTP 요청(Request)을 받아 응답(Response)을 반환하는 프레젠테이션 계층입니다.
  - **양식:** `@RestController`와 `@RequestMapping`을 사용하며, 요청 데이터는 DTO(`@RequestBody`)로 받습니다. 비즈니스 로직은 직접 처리하지 않고 Service 계층을 호출합니다.
  
- **DTO (`backapp/dto/`)**
  - **역할:** Data Transfer Object. 클라이언트와 서버 간 데이터를 주고받을 때 사용하는 객체입니다.
  - **양식:** Entity 객체를 직접 노출하지 않고, 화면에서 필요한 데이터만 담아 전송하는 용도로 사용합니다.

- **Service (`backmgr/service/`)**
  - **역할:** 실제 비즈니스 로직이 수행되는 계층입니다.
  - **양식:** `@Service` 어노테이션을 붙이며, 데이터 변경이 일어나는 메서드에는 `@Transactional`을 선언해 데이터 정합성을 보장합니다. 에러가 발생해야 할 상황(예: 중복 회원)에서는 `IllegalArgumentException` 등을 던져(Throw) 컨트롤러가 이를 잡아 400 에러로 응답하게 합니다.

- **Repository (`backmgr/repository/`)**
  - **역할:** 데이터베이스와 직접 통신하는 계층입니다.
  - **양식:** Spring Data JPA의 `JpaRepository<Entity, ID>` 인터페이스를 상속받아 사용하며, 기본 CRUD 외에 `findByUsername`과 같은 쿼리 메서드를 정의하여 사용합니다.

- **Entity (`backmgr/entity/`)**
  - **역할:** 데이터베이스 테이블과 1:1로 매핑되는 객체입니다.
  - **양식:** `@Entity`, `@Id`, `@GeneratedValue` 등을 사용하여 테이블을 정의합니다. 데이터 베이스 설정에서 `ddl-auto: update`를 사용 중이므로, 이 클래스에 필드를 추가하면 자동으로 DB 컬럼이 생성됩니다.
