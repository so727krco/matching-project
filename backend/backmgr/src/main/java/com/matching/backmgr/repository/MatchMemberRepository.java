package com.matching.backmgr.repository;

import com.matching.backmgr.entity.MatchMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchMemberRepository extends JpaRepository<MatchMember, Long> {
}
