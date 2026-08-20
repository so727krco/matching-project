package com.matching.backmgr.repository;

import com.matching.backmgr.entity.MatchingHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchingHistoryRepository extends JpaRepository<MatchingHistory, Long> {
    List<MatchingHistory> findAllByOrderByCreatedAtDesc();
}
