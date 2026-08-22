const fs = require('fs');
let content = fs.readFileSync('backmgr/src/main/java/com/matching/backmgr/service/MemberService.java', 'utf8');

// Add import
content = content.replace(
  "import com.matching.backmgr.service.impl.MockMatchingAiServiceImpl;",
  "import com.matching.backmgr.service.impl.MockMatchingAiServiceImpl;\nimport com.matching.backmgr.dto.AiProfileResult;"
);

// Replace logic
const oldLogic = `        // 3. AI 호출 및 결과 추출 (예외 발생 시 롤백됨)
        Map<String, Integer> extractedTraits = aiServiceToUse.profileMemberTraits(profileText);
        
        // 4. 추출된 데이터를 MemberTrait 테이블에 저장
        if (extractedTraits != null && !extractedTraits.isEmpty()) {
            MemberTrait memberTrait = MemberTrait.builder()
                    .member(savedMember)
                    .traits(extractedTraits)
                    .build();
            memberTraitRepository.save(memberTrait);
            log.info("AI 프로파일링 완료 - 추출된 특성 갯수: {}", extractedTraits.size());
        } else {
            throw new RuntimeException("AI가 회원 특성을 추출하지 못했습니다. (빈 결과 반환)");
        }`;

const newLogic = `        // 3. AI 호출 및 결과 추출 (예외 발생 시 롤백됨)
        AiProfileResult aiResult = aiServiceToUse.profileMemberTraits(profileText);
        Map<String, Integer> extractedTraits = aiResult.getTraits();
        
        // 4. 추출된 데이터를 MemberTrait 테이블에 저장 및 AI 분석 의견 저장
        if (extractedTraits != null && !extractedTraits.isEmpty()) {
            MemberTrait memberTrait = MemberTrait.builder()
                    .member(savedMember)
                    .traits(extractedTraits)
                    .build();
            memberTraitRepository.save(memberTrait);
            
            // Save AI remarks to Member
            savedMember.setAiRemarks(aiResult.getAnalysisRemarks());
            memberRepository.save(savedMember);
            
            log.info("AI 프로파일링 완료 - 추출된 특성 갯수: {}", extractedTraits.size());
        } else {
            throw new RuntimeException("AI가 회원 특성을 추출하지 못했습니다. (빈 결과 반환)");
        }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('backmgr/src/main/java/com/matching/backmgr/service/MemberService.java', content, 'utf8');
console.log('Fixed MemberService');
