package com.matching.backmgr.repository;

import com.matching.backmgr.entity.AiConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiConfigRepository extends JpaRepository<AiConfig, Long> {
    Optional<AiConfig> findByIsActiveTrue();
}
