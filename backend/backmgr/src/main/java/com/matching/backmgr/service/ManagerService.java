package com.matching.backmgr.service;

import com.matching.backmgr.entity.Manager;
import com.matching.backmgr.repository.ManagerRepository;
import com.matching.backmgr.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagerService {

    private final ManagerRepository managerRepository;

    @Transactional
    public Manager register(Manager manager) {
        // Backend validation
        if (manager.getUsername() == null || manager.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("아이디는 필수입니다.");
        }
        if (manager.getPassword() == null || manager.getPassword().length() <= 6) {
            throw new IllegalArgumentException("비밀번호는 7자 이상이어야 합니다.");
        }
        if (manager.getEmpNo() == null || manager.getEmpNo().length() != 8) {
            throw new IllegalArgumentException("사번은 8자리여야 합니다.");
        }
        if (manager.getName() == null || manager.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("이름은 필수입니다.");
        }
        if (manager.getBirthDate() == null) {
            throw new IllegalArgumentException("생년월일은 필수입니다.");
        }
        if (manager.getIntroduction() == null || manager.getIntroduction().trim().isEmpty()) {
            throw new IllegalArgumentException("자기소개는 필수입니다.");
        }

        // Check if username already exists
        if (managerRepository.findByUsername(manager.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // Apply masking and hashing
        // manager.setName(SecurityUtil.maskName(manager.getName()));
        manager.setPassword(SecurityUtil.hashPassword(manager.getPassword()));

        return managerRepository.save(manager);
    }

    public Manager login(String username, String password) {
        Manager manager = managerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        String hashedPassword = SecurityUtil.hashPassword(password);
        if (!manager.getPassword().equals(hashedPassword)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return manager;
    }

    public boolean checkUsername(String username) {
        return managerRepository.findByUsername(username).isPresent();
    }

    @Transactional
    public void resetPassword(String username, String newPassword) {
        Manager manager = managerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (newPassword == null || newPassword.length() <= 6) {
            throw new IllegalArgumentException("새 비밀번호는 7자 이상이어야 합니다.");
        }

        manager.setPassword(SecurityUtil.hashPassword(newPassword));
    }

    public boolean checkIsAdmin(Long id) {
        return managerRepository.findById(id)
                .map(Manager::getIsAdmin)
                .orElse(false);
    }
}
