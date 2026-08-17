package com.matching.backapp.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ManagerDTO {
    private Long id;
    private String username;
    private String password; // Only used for requests
    private String name;
    private String empNo;
    private LocalDate birthDate;
    private String introduction;
}
