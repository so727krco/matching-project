package com.matching.backmgr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "manager")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Manager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., '매니저A'

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(length = 8, nullable = false)
    private String empNo;

    @Column(nullable = false)
    private LocalDate birthDate;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isAdmin = false;
}
