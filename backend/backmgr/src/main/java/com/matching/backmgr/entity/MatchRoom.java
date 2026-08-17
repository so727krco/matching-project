package com.matching.backmgr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "match_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    private LocalDate matchDate;

    @Enumerated(EnumType.STRING)
    private MatchStatus status; // 'pending' | 'completed' | 'cancelled'

    @Builder.Default
    @OneToMany(mappedBy = "matchRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MatchMember> members = new ArrayList<>();

    public enum MatchStatus {
        PENDING, COMPLETED, CANCELLED
    }
}
