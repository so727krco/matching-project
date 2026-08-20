package com.matching.backmgr.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "matching_trait_reference")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchingTraitReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category; // LOOKS, PERSONALITY, IDEAL_TYPE

    @Column(nullable = false, length = 100)
    private String keyword;
}
