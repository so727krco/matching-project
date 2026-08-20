package com.matching.backmgr.entity;

import com.matching.backmgr.converter.MapToJsonConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "member_trait")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberTrait {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Convert(converter = MapToJsonConverter.class)
    @Column(columnDefinition = "json", nullable = false)
    @Builder.Default
    private Map<String, Integer> traits = new HashMap<>();
}
