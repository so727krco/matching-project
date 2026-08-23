package com.matching.backapp.controller;

import com.matching.backapp.dto.MemberRegistrationRequest;
import com.matching.backmgr.entity.Member;
import com.matching.backmgr.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
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

    @GetMapping("/{id}/traits")
    public ResponseEntity<java.util.Map<String, Integer>> getMemberTraits(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getMemberTraits(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createMember(@ModelAttribute MemberRegistrationRequest request,
                                          @RequestParam(value = "photoFiles", required = false) List<org.springframework.web.multipart.MultipartFile> photoFiles) {
        if (!request.isValidContact()) {
            return ResponseEntity.badRequest().body("휴대전화번호 또는 카카오톡 ID 중 하나는 필수입니다.");
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
                .build();

        try {
            Member savedMember = memberService.registerMember(member, request.getManagerId(), photoFiles);
            return ResponseEntity.ok(savedMember);
        } catch (Exception e) {
            if ("GEMINI_RATE_LIMIT_EXCEEDED".equals(e.getMessage()) || (e.getMessage() != null && e.getMessage().contains("GEMINI_RATE_LIMIT_EXCEEDED"))) {
                return ResponseEntity.status(429).body("Gemini API Rate Limit Exceeded");
            }
            return ResponseEntity.badRequest().body("회원 등록 실패: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @RequestBody Member updateData) {
        return ResponseEntity.ok(memberService.updateMember(id, updateData));
    }
}
