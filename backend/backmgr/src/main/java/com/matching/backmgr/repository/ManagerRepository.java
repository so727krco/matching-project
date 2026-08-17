package com.matching.backmgr.repository;

import com.matching.backmgr.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Long> {
    Optional<Manager> findByName(String name);
    Optional<Manager> findByUsername(String username);
}
