package com.matching.backapp.controller;

import com.matching.backapp.dto.ManagerDTO;
import com.matching.backapp.dto.PasswordResetDTO;
import com.matching.backmgr.entity.Manager;
import com.matching.backmgr.service.ManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/managers")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerService managerService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody ManagerDTO dto) {
        try {
            Manager manager = Manager.builder()
                    .username(dto.getUsername())
                    .password(dto.getPassword())
                    .empNo(dto.getEmpNo())
                    .name(dto.getName())
                    .birthDate(dto.getBirthDate())
                    .introduction(dto.getIntroduction())
                    .build();

            Manager registered = managerService.register(manager);

            ManagerDTO response = new ManagerDTO();
            response.setId(registered.getId());
            response.setUsername(registered.getUsername());
            response.setName(registered.getName());
            response.setEmpNo(registered.getEmpNo());
            response.setBirthDate(registered.getBirthDate());
            response.setIntroduction(registered.getIntroduction());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("회원가입 처리 중 오류가 발생했습니다.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody ManagerDTO dto) {
        try {
            Manager manager = managerService.login(dto.getUsername(), dto.getPassword());

            ManagerDTO response = new ManagerDTO();
            response.setId(manager.getId());
            response.setUsername(manager.getUsername());
            response.setName(manager.getName());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("로그인 처리 중 오류가 발생했습니다.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDTO dto) {
        try {
            managerService.resetPassword(dto.getUsername(), dto.getNewPassword());
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("비밀번호 변경 처리 중 오류가 발생했습니다.");
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        try {
            boolean exists = managerService.checkUsername(username);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("아이디 확인 중 오류가 발생했습니다.");
        }
    }
}
