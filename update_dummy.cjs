const fs = require('fs');
let content = fs.readFileSync('backend/backapp/src/main/java/com/matching/backapp/controller/DummyDataController.java', 'utf8');

// Insert approvalRequestRepository dependency
content = content.replace(/private final ManagerRepository managerRepository;/g, "private final ManagerRepository managerRepository;\n    private final com.matching.backmgr.repository.ApprovalRequestRepository approvalRequestRepository;");

// In the constructor
content = content.replace(/public DummyDataController\(MemberRepository memberRepository, ManagerRepository managerRepository\) \{/g, "public DummyDataController(MemberRepository memberRepository, ManagerRepository managerRepository, com.matching.backmgr.repository.ApprovalRequestRepository approvalRequestRepository) {");
content = content.replace(/this\.managerRepository = managerRepository;/g, "this.managerRepository = managerRepository;\n        this.approvalRequestRepository = approvalRequestRepository;");

// In generateDummyData, delete approval requests first
content = content.replace(/memberRepository\.deleteAllInBatch\(\);/g, "approvalRequestRepository.deleteAllInBatch();\n        memberRepository.deleteAllInBatch();");

fs.writeFileSync('backend/backapp/src/main/java/com/matching/backapp/controller/DummyDataController.java', content, 'utf8');
