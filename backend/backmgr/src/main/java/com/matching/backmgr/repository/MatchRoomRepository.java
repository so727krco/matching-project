package com.matching.backmgr.repository;

import com.matching.backmgr.entity.MatchRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchRoomRepository extends JpaRepository<MatchRoom, Long> {
}
