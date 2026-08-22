package com.matching.backmgr.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.matching.backmgr.dto.MemberSearchCondition;
import com.matching.backmgr.entity.AiConfig;
import com.matching.backmgr.entity.Manager;
import com.matching.backmgr.entity.Member;
import com.matching.backmgr.entity.MemberTrait;
import com.matching.backmgr.repository.AiConfigRepository;
import com.matching.backmgr.repository.ManagerRepository;
import com.matching.backmgr.repository.MatchingTraitReferenceRepository;
import com.matching.backmgr.repository.MemberRepository;
import com.matching.backmgr.repository.MemberTraitRepository;
import com.matching.backmgr.service.impl.GeminiMatchingAiServiceImpl;
import com.matching.backmgr.service.impl.MockMatchingAiServiceImpl;
import com.matching.backmgr.dto.AiProfileResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final ManagerRepository managerRepository;
    private final AiConfigRepository aiConfigRepository;
    private final MatchingTraitReferenceRepository traitRefRepository;
    private final ObjectMapper objectMapper;
    private final MemberTraitRepository memberTraitRepository;
    private final MockMatchingAiServiceImpl mockAiService;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }
    
    public List<Member> searchMembers(MemberSearchCondition condition) {
        return memberRepository.searchMembers(condition);
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));
    }

    public Map<String, Integer> getMemberTraits(Long memberId) {
        return memberTraitRepository.findByMemberId(memberId)
                .map(MemberTrait::getTraits)
                .orElse(java.util.Collections.emptyMap());
    }

    @Transactional
    public Member createMember(Member member) {
        return memberRepository.save(member);
    }

    @Transactional
    public Member registerMember(Member member, Long managerId) {
        // Validate contact info
        boolean hasPhone = member.getPhoneNumber() != null && !member.getPhoneNumber().trim().isEmpty();
        boolean hasKakao = member.getKakaoId() != null && !member.getKakaoId().trim().isEmpty();
        
        if (!hasPhone && !hasKakao) {
            throw new IllegalArgumentException("휴대전화번호 또는 카카오톡 ID 중 하나는 필수입니다.");
        }

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
        
        member.setManager(manager);
        member.setStatus(Member.MemberStatus.PENDING);
        
        Member savedMember = memberRepository.save(member);
        
        // --- AI 자동 프로파일링 로직 시작 ---
        // 1. 회원 프로필 정보 문자열 조합
        String profileText = String.format(
            "성별: %s\n나이: %d\n직업: %s\n연소득: %s\n취미: %s\n이상형: %s\n자기소개: %s\n주의사항: %s",
            member.getGender() != null ? member.getGender() : "알수없음",
            member.getAge(),
            member.getJob() != null ? member.getJob() : "없음",
            member.getSalary() != null ? member.getSalary() : "알수없음",
            member.getHobbies() != null ? member.getHobbies() : "없음",
            member.getIdealType() != null ? member.getIdealType() : "없음",
            member.getIntroduction() != null ? member.getIntroduction() : "없음",
            member.getRemarks() != null ? member.getRemarks() : "없음"
        );
        
        log.info("회원 가입 완료, AI 프로파일링 시작 - 회원ID: {}", savedMember.getId());
        
        // 2. AI Service 생성 (설정에 따라 MOCK 또는 GEMINI)
        AiConfig activeConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("MEMBER_PROFILING").orElseGet(() -> aiConfigRepository.findByIsActiveTrue().orElse(null));
        MatchingAiService aiServiceToUse = mockAiService;
        
        if (activeConfig != null && "GEMINI".equalsIgnoreCase(activeConfig.getProvider())) {
            aiServiceToUse = new GeminiMatchingAiServiceImpl(
                activeConfig.getApiUrl(),
                activeConfig.getApiKey(), 
                activeConfig.getSystemPrompt(), 
                traitRefRepository, 
                objectMapper
            );
        }
        
        // 3. AI 호출 및 결과 추출 (예외 발생 시 롤백됨)
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
        }
        
        return savedMember;
    }

    @Transactional
    public Member updateMember(Long id, Member updateData) {
        Member member = getMemberById(id);
        member.setName(updateData.getName());
        member.setAge(updateData.getAge());
        member.setHeight(updateData.getHeight());
        member.setJob(updateData.getJob());
        member.setSalary(updateData.getSalary());
        member.setStatus(updateData.getStatus());
        return member;
    }
}
