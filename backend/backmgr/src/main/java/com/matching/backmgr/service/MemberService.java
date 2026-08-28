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
    public Member registerMember(Member member, Long managerId, List<org.springframework.web.multipart.MultipartFile> photoFiles) {
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
        
        // --- Photo Upload Logic ---
        List<String> base64Images = new java.util.ArrayList<>();
        if (photoFiles != null && !photoFiles.isEmpty()) {
            java.nio.file.Path uploadDir = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploads");
            try {
                if (!java.nio.file.Files.exists(uploadDir)) {
                    java.nio.file.Files.createDirectories(uploadDir);
                }
                int seq = 1;
                for (org.springframework.web.multipart.MultipartFile file : photoFiles) {
                    if (file.isEmpty()) continue;
                    String ext = ".jpg";
                    String originalName = file.getOriginalFilename();
                    if (originalName != null && originalName.contains(".")) {
                        ext = originalName.substring(originalName.lastIndexOf("."));
                    }
                    String fileName = savedMember.getId() + "_" + seq + ext;
                    java.nio.file.Path targetPath = uploadDir.resolve(fileName);
                    file.transferTo(targetPath.toFile());
                    
                    String url = "/uploads/" + fileName;
                    if (seq == 1) savedMember.setImageUrl1(url);
                    else if (seq == 2) savedMember.setImageUrl2(url);
                    else if (seq == 3) savedMember.setImageUrl3(url);
                    else if (seq == 4) savedMember.setImageUrl4(url);
                    else if (seq == 5) savedMember.setImageUrl5(url);
                    
                    // Convert to base64 for AI processing
                    byte[] bytes = java.nio.file.Files.readAllBytes(targetPath);
                    base64Images.add(java.util.Base64.getEncoder().encodeToString(bytes));
                    seq++;
                    if (seq > 5) break;
                }
                savedMember = memberRepository.save(savedMember);
            } catch (Exception e) {
                log.error("Failed to save uploaded files", e);
            }
        }
        
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
        AiConfig activeConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("MEMBER_PROFILING")
                .orElseGet(() -> aiConfigRepository.findAll().stream().filter(AiConfig::getIsActive).findFirst().orElse(null));
        AiConfig embeddingConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("EMBEDDING")
                .orElse(activeConfig);
        
        MatchingAiService aiServiceToUse = mockAiService;
        
        if (activeConfig != null && "GEMINI".equalsIgnoreCase(activeConfig.getProvider())) {
            aiServiceToUse = new GeminiMatchingAiServiceImpl(
                activeConfig.getApiUrl(),
                activeConfig.getApiKey(), 
                embeddingConfig != null ? embeddingConfig.getApiUrl() : "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
                embeddingConfig != null ? embeddingConfig.getApiKey() : activeConfig.getApiKey(),
                activeConfig.getSystemPrompt(), 
                traitRefRepository, 
                objectMapper
            );
        }
        
        // 3. AI 호출 및 결과 추출 (예외 발생 시 롤백됨)
        AiProfileResult aiResult = aiServiceToUse.profileMemberTraits(profileText);
        Map<String, Integer> extractedTraits = new java.util.HashMap<>(aiResult.getTraits());
        
        // --- Photo Verification ---

        String finalAiRemarks = "[프로필 분석]\n" + aiResult.getAnalysisRemarks();

        if (!base64Images.isEmpty()) {
            com.matching.backmgr.dto.AiPhotoResult photoResult = aiServiceToUse.verifyPhotosAndExtractTraits(base64Images);
            savedMember.setAiVerificationPassed(photoResult.isFinalPassed());
            finalAiRemarks = "[사진 검증: " + photoResult.getReason() + "]\n" + finalAiRemarks;
            
            if (photoResult.getAppearanceTraits() != null) {
                extractedTraits.putAll(photoResult.getAppearanceTraits());
            }
        } else {
            savedMember.setAiVerificationPassed(false);
            finalAiRemarks = "[사진 검증: 업로드된 사진이 없습니다.]\n" + finalAiRemarks;
        }

        // 4. 추출된 데이터를 MemberTrait 테이블에 저장 및 AI 분석 의견 저장
        if (!extractedTraits.isEmpty() || (aiResult.getIdealTraits() != null && !aiResult.getIdealTraits().isEmpty())) {
            MemberTrait memberTrait = MemberTrait.builder()
                    .member(savedMember)
                    .traits(extractedTraits)
                    .idealTraits(aiResult.getIdealTraits() != null ? aiResult.getIdealTraits() : new java.util.HashMap<>())
                    .build();
            updateMemberTraitVectors(memberTrait);
            memberTraitRepository.save(memberTrait);
            
            // Save AI remarks to Member
            savedMember.setAiRemarks(finalAiRemarks);
            memberRepository.save(savedMember);
            
            log.info("AI 프로파일링 완료 - 추출된 특성 갯수: {}", extractedTraits.size());
        } else {
            throw new RuntimeException("AI가 회원 특성을 추출하지 못했습니다. (빈 결과 반환)");
        }
        
        return savedMember;
    }

    @Transactional
    public Member updateMember(Long id, Member request, List<String> existingUrls, List<org.springframework.web.multipart.MultipartFile> photoFiles, Long requesterManagerId) {
        Member member = getMemberById(id);
        
        Manager requester = managerRepository.findById(requesterManagerId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
        
        if (!requester.getId().equals(member.getManager().getId()) && (requester.getIsAdmin() == null || !requester.getIsAdmin())) {
            throw new IllegalArgumentException("해당 회원의 정보를 수정할 권한이 없습니다.");
        }
        
        java.time.LocalDate today = java.time.LocalDate.now();
        if (member.getLastUpdateDate() == null || !member.getLastUpdateDate().equals(today)) {
            member.setUpdateCountToday(0);
            member.setLastUpdateDate(today);
        }
        
        if (member.getUpdateCountToday() >= 3) {
            throw new RuntimeException("하루 3회 수정 횟수를 초과했습니다.");
        }
        
        member.setName(request.getName());
        member.setGender(request.getGender());
        member.setAge(request.getAge());
        member.setHeight(request.getHeight());
        member.setJob(request.getJob());
        member.setSalary(request.getSalary());
        member.setPhoneNumber(request.getPhoneNumber());
        member.setKakaoId(request.getKakaoId());
        member.setHobbies(request.getHobbies());
        member.setIdealType(request.getIdealType());
        member.setIntroduction(request.getIntroduction());
        member.setRemarks(request.getRemarks());

        // Handle existing URLs
        List<String> finalUrls = new java.util.ArrayList<>();
        if (existingUrls != null) {
            finalUrls.addAll(existingUrls);
        }

        // Handle new photo files
        if (photoFiles != null && !photoFiles.isEmpty()) {
            java.nio.file.Path uploadDir = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploads");
            try {
                if (!java.nio.file.Files.exists(uploadDir)) {
                    java.nio.file.Files.createDirectories(uploadDir);
                }
                int newSeq = finalUrls.size() + 1;
                for (org.springframework.web.multipart.MultipartFile file : photoFiles) {
                    if (file.isEmpty()) continue;
                    if (finalUrls.size() >= 5) break;
                    String ext = ".jpg";
                    String originalName = file.getOriginalFilename();
                    if (originalName != null && originalName.contains(".")) {
                        ext = originalName.substring(originalName.lastIndexOf("."));
                    }
                    String fileName = member.getId() + "_update_" + System.currentTimeMillis() + "_" + newSeq + ext;
                    java.nio.file.Path targetPath = uploadDir.resolve(fileName);
                    file.transferTo(targetPath.toFile());
                    finalUrls.add("/uploads/" + fileName);
                    newSeq++;
                }
            } catch (Exception e) {
                log.error("Failed to save updated uploaded files", e);
            }
        }

        member.setImageUrl1(finalUrls.size() > 0 ? finalUrls.get(0) : null);
        member.setImageUrl2(finalUrls.size() > 1 ? finalUrls.get(1) : null);
        member.setImageUrl3(finalUrls.size() > 2 ? finalUrls.get(2) : null);
        member.setImageUrl4(finalUrls.size() > 3 ? finalUrls.get(3) : null);
        member.setImageUrl5(finalUrls.size() > 4 ? finalUrls.get(4) : null);

        // Run AI Reprofiling
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
        
        AiConfig activeConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("MEMBER_PROFILING")
                .orElseGet(() -> aiConfigRepository.findAll().stream().filter(AiConfig::getIsActive).findFirst().orElse(null));
        AiConfig embeddingConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("EMBEDDING")
                .orElse(activeConfig);
        
        MatchingAiService aiServiceToUse = mockAiService;
        if (activeConfig != null && "GEMINI".equalsIgnoreCase(activeConfig.getProvider())) {
            aiServiceToUse = new GeminiMatchingAiServiceImpl(
                activeConfig.getApiUrl(), 
                activeConfig.getApiKey(), 
                embeddingConfig != null ? embeddingConfig.getApiUrl() : "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
                embeddingConfig != null ? embeddingConfig.getApiKey() : activeConfig.getApiKey(),
                activeConfig.getSystemPrompt(), 
                traitRefRepository, 
                objectMapper
            );
        }
        
        AiProfileResult aiResult = aiServiceToUse.profileMemberTraits(profileText);
        Map<String, Integer> extractedTraits = new java.util.HashMap<>(aiResult.getTraits());
        String finalAiRemarks = "[프로필 분석(수정)]\n" + aiResult.getAnalysisRemarks();
        
        List<String> base64Images = new java.util.ArrayList<>();
        for (String url : finalUrls) {
            if (url == null) continue;
            try {
                String fileName = url.replace("/uploads/", "");
                java.nio.file.Path filePath = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploads", fileName);
                byte[] bytes = java.nio.file.Files.readAllBytes(filePath);
                base64Images.add(java.util.Base64.getEncoder().encodeToString(bytes));
            } catch (Exception e) {
                log.warn("Failed to read image for AI reprofiling: " + url, e);
            }
        }

        if (!base64Images.isEmpty()) {
            com.matching.backmgr.dto.AiPhotoResult photoResult = aiServiceToUse.verifyPhotosAndExtractTraits(base64Images);
            member.setAiVerificationPassed(photoResult.isFinalPassed());
            finalAiRemarks = "[사진 검증(수정): " + photoResult.getReason() + "]\n" + finalAiRemarks;
            if (photoResult.getAppearanceTraits() != null) {
                extractedTraits.putAll(photoResult.getAppearanceTraits());
            }
        } else {
            member.setAiVerificationPassed(false);
            finalAiRemarks = "[사진 검증: 업로드된 사진이 없습니다.]\n" + finalAiRemarks;
        }

        if (!extractedTraits.isEmpty() || (aiResult.getIdealTraits() != null && !aiResult.getIdealTraits().isEmpty())) {
            MemberTrait memberTrait = memberTraitRepository.findByMemberId(id).orElseGet(() -> MemberTrait.builder().member(member).build());
            memberTrait.setTraits(extractedTraits);
            memberTrait.setIdealTraits(aiResult.getIdealTraits() != null ? aiResult.getIdealTraits() : new java.util.HashMap<>());
            updateMemberTraitVectors(memberTrait);
            memberTraitRepository.save(memberTrait);
            member.setAiRemarks(finalAiRemarks);
        }
        
        member.setUpdateCountToday(member.getUpdateCountToday() + 1);
        return memberRepository.save(member);
    }
    
    @Transactional
    public void reprofileMemberViaAi(Long id) {
        Member member = memberRepository.findById(id).orElseThrow(() -> new RuntimeException("Member not found"));
        
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
        
        AiConfig activeConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("MEMBER_PROFILING")
                .orElseGet(() -> aiConfigRepository.findAll().stream().filter(AiConfig::getIsActive).findFirst().orElse(null));
        AiConfig embeddingConfig = aiConfigRepository.findByIsActiveTrueAndUsageType("EMBEDDING")
                .orElse(activeConfig);
        
        MatchingAiService aiServiceToUse = mockAiService;
        if (activeConfig != null && "GEMINI".equalsIgnoreCase(activeConfig.getProvider())) {
            aiServiceToUse = new GeminiMatchingAiServiceImpl(
                activeConfig.getApiUrl(), 
                activeConfig.getApiKey(), 
                embeddingConfig != null ? embeddingConfig.getApiUrl() : "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
                embeddingConfig != null ? embeddingConfig.getApiKey() : activeConfig.getApiKey(),
                activeConfig.getSystemPrompt(), 
                traitRefRepository, 
                objectMapper
            );
        }
        
        AiProfileResult aiResult = aiServiceToUse.profileMemberTraits(profileText);
        Map<String, Integer> extractedTraits = new java.util.HashMap<>(aiResult.getTraits());
        String finalAiRemarks = "[프로필 분석(마이그레이션)]\n" + aiResult.getAnalysisRemarks();
        
        if (!extractedTraits.isEmpty() || (aiResult.getIdealTraits() != null && !aiResult.getIdealTraits().isEmpty())) {
            MemberTrait memberTrait = memberTraitRepository.findByMemberId(id).orElseGet(() -> MemberTrait.builder().member(member).build());
            memberTrait.setTraits(extractedTraits);
            memberTrait.setIdealTraits(aiResult.getIdealTraits() != null ? aiResult.getIdealTraits() : new java.util.HashMap<>());
            
            updateMemberTraitVectors(memberTrait);
            
            memberTraitRepository.save(memberTrait);
            member.setAiRemarks(finalAiRemarks);
        }
        
        memberRepository.save(member);
    }
    
    private void updateMemberTraitVectors(MemberTrait memberTrait) {
        List<com.matching.backmgr.entity.MatchingTraitReference> refs = traitRefRepository.findAll();
        Map<String, double[]> refMap = new java.util.HashMap<>();
        for (com.matching.backmgr.entity.MatchingTraitReference ref : refs) {
            double[] vec = com.matching.backmgr.util.VectorUtil.parseVector(ref.getEmbeddingData());
            if (vec != null) {
                refMap.put(ref.getKeyword(), vec);
            }
        }
        
        double[] ownVec = com.matching.backmgr.util.VectorUtil.calculateWeightedAverage(memberTrait.getTraits(), refMap);
        double[] idealVec = com.matching.backmgr.util.VectorUtil.calculateWeightedAverage(memberTrait.getIdealTraits(), refMap);
        
        memberTrait.setOwnVector(com.matching.backmgr.util.VectorUtil.toJson(ownVec));
        memberTrait.setIdealVector(com.matching.backmgr.util.VectorUtil.toJson(idealVec));
    }
}
