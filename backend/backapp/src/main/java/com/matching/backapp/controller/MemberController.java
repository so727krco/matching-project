package com.matching.backapp.controller;

import com.matching.backapp.dto.MemberRegistrationRequest;
import com.matching.backmgr.entity.Member;
import com.matching.backmgr.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<List<Member>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Member>> searchMembers(@ModelAttribute com.matching.backmgr.dto.MemberSearchCondition condition) {
        return ResponseEntity.ok(memberService.searchMembers(condition));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMember(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getMemberById(id));
    }

    @PostMapping
    public ResponseEntity<?> createMember(@RequestBody MemberRegistrationRequest request) {
        if (!request.isValidContact()) {
            return ResponseEntity.badRequest().body("휴대전화번호 혹은 카카오톡 ID 둘 중 하나는 필수입니다.");
        }
        
        if (request.getManagerId() == null) {
            return ResponseEntity.badRequest().body("매니저 ID가 누락되었습니다.");
        }

        Member member = Member.builder()
                .name(request.getName())
                .gender(request.getGender())
                .age(request.getAge())
                .height(request.getHeight())
                .job(request.getJob())
                .salary(request.getSalary())
                .phoneNumber(request.getPhoneNumber())
                .kakaoId(request.getKakaoId())
                .hobbies(request.getHobbies())
                .idealType(request.getIdealType())
                .introduction(request.getIntroduction())
                .remarks(request.getRemarks())
                .imageUrl1(request.getImageUrl1())
                .imageUrl2(request.getImageUrl2())
                .imageUrl3(request.getImageUrl3())
                .imageUrl4(request.getImageUrl4())
                .imageUrl5(request.getImageUrl5())
                .build();

        try {
            Member savedMember = memberService.registerMember(member, request.getManagerId());
            return ResponseEntity.ok(savedMember);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @RequestBody Member updateData) {
        return ResponseEntity.ok(memberService.updateMember(id, updateData));
    }
}
