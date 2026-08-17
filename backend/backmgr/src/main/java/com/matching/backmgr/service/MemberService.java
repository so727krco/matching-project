package com.matching.backmgr.service;

import com.matching.backmgr.dto.MemberSearchCondition;
import com.matching.backmgr.entity.Manager;
import com.matching.backmgr.entity.Member;
import com.matching.backmgr.repository.ManagerRepository;
import com.matching.backmgr.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final ManagerRepository managerRepository;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }
    
    public List<Member> searchMembers(MemberSearchCondition condition) {
        return memberRepository.searchMembers(condition);
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Member not found"));
    }

    @Transactional
    public Member createMember(Member member) {
        return memberRepository.save(member);
    }

    @Transactional
    public Member registerMember(Member member, Long managerId) {
        // Validate contact info (business logic level)
        boolean hasPhone = member.getPhoneNumber() != null && !member.getPhoneNumber().trim().isEmpty();
        boolean hasKakao = member.getKakaoId() != null && !member.getKakaoId().trim().isEmpty();
        
        if (!hasPhone && !hasKakao) {
            throw new IllegalArgumentException("휴대전화번호 또는 카카오톡 ID 중 하나는 필수입니다.");
        }

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
        
        member.setManager(manager);
        member.setStatus(Member.MemberStatus.PENDING); // 기본 상태를 '심사중' 또는 '대기중'으로 설정
        
        return memberRepository.save(member);
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
        // More fields can be updated here
        return member;
    }
}
