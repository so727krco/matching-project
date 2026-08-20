package com.matching.backmgr.repository;

import com.matching.backmgr.entity.MatchingTraitReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchingTraitReferenceRepository extends JpaRepository<MatchingTraitReference, Long> {
}
