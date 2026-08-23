# 승인관리 시스템 구현 가이드

## 개요
이 문서는 백엔드와 프론트엔드를 통틀어 승인관리 시스템이 어떻게 구현되었는지를 설명합니다.
매칭 프로젝트 내에서 매니저간의 권한 이관(담당 변경) 및 정보 열람 권한 요청을 처리하기 위해 만들어졌습니다.

## 백엔드 구현 로직

### 엔티티 및 DB 구조 (ApprovalRequest)
- 데이터베이스에는 approval_request 라는 테이블이 생성되어 있습니다.
- type: INFO_VIEW (정보열람), TRANSFER (담당변경) 의 승인 종류를 나타냅니다. (매칭 초대 승인은 현재 기능 미구현으로 제외됨)
- requester_id: 승인을 요청한 매니저의 고유 ID입니다.
- target_manager_id: 승인 요청을 받는 대상 매니저의 고유 ID입니다. (예: 회원의 현재 담당 매니저)
- target_member_id: 승인 대상이 되는 회원의 고유 ID입니다.
- status: PENDING (대기중), APPROVED (승인됨), REJECTED (반려됨), CANCELED (취소됨) 상태값을 가집니다.

### 주요 서비스 로직 (ApprovalRequestService)
- 승인 생성 (createRequest): 프론트엔드에서 특정 회원에 대해 담당 변경이나 정보 열람을 누르면, 백엔드 DB에 PENDING 상태로 레코드가 생성됩니다.
- 승인 수락 (approve): 요청받은 매니저가 수락 버튼을 누르면 DB 상태가 APPROVED로 변경됩니다. 특히 TRANSFER(담당 변경) 요청인 경우, Member 테이블의 해당 회원 담당 매니저 ID가 승인을 요청했던 매니저의 ID로 즉시 자동 업데이트 됩니다.
- 승인 거절 (reject): 요청받은 매니저가 거절 버튼을 누르면 DB 상태가 REJECTED로 변경됩니다.

### 컨트롤러 (ApprovalRequestController)
- GET /api/approvals: 특정 매니저(managerId)가 받은 요청 또는 보낸 요청 목록을 조회합니다. 필터링은 type 파라미터를 통해 received(받은 요청)와 sent(보낸 요청)를 구분합니다.
- POST /api/approvals: 새로운 승인 요청을 생성합니다.
- PUT /api/approvals/{id}/approve: 승인 요청을 승인 처리합니다.
- PUT /api/approvals/{id}/reject: 승인 요청을 반려 처리합니다.

## 프론트엔드 구현 로직

### 메인 화면 연동 (MainScreen.tsx)
- 화면 상단에 환영 인사말과 함께 현재 로그인한 매니저의 이름이 마스킹 없이 전체 이름으로 표시되도록 구현되었습니다. (예: 환영합니다, 매니저1님!)
- 승인관리 메뉴 카드에 띄워지는 알림 뱃지는 백엔드에서 실시간으로 PENDING 상태의 받은 요청 개수를 카운트하여 표시합니다.

### 회원 조회 연동 (MemberInquiry.tsx)
- 검색을 통해 회원을 조회한 후, 타 매니저가 관리하는 회원에 대해 정보열람 또는 담당변경 버튼을 누르면 백엔드의 승인 생성 API가 호출되어 실제 승인 프로세스가 진행됩니다.

### 승인 관리 화면 (ApprovalManagement.tsx)
- 상단 탭을 통해 내가 받은 승인과 내가 보낸 승인을 분리하여 볼 수 있습니다.
- 내가 받은 승인의 경우, 버튼을 통해 즉각적으로 승인(API approve) 혹은 반려(API reject) 처리를 할 수 있으며, 처리가 완료되면 화면이 새로고침되어 상태가 반영됩니다.
- 이전의 localStorage 기반 임시 더미 로직은 모두 제거되고 실제 REST API 기반 비동기 통신 로직으로 대체되었습니다.
