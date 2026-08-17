package com.matching.backapp.dto;

import lombok.Data;

@Data
public class PasswordResetDTO {
    private String username;
    private String newPassword;
}
