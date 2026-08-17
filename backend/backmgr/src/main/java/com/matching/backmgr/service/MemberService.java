package com.matching.backmgr.service;

import com.matching.backmgr.entity.Member;
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

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Member not found"));
    }

    @Transactional
    public Member createMember(Member member) {
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
