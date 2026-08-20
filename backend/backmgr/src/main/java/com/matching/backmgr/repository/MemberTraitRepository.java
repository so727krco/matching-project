package com.matching.backmgr.repository;

import com.matching.backmgr.entity.MemberTrait;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MemberTraitRepository extends JpaRepository<MemberTrait, Long> {
    Optional<MemberTrait> findByMemberId(Long memberId);
}
