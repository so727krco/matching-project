package com.matching.backmgr.repository;

import com.matching.backmgr.dto.MemberSearchCondition;
import com.matching.backmgr.entity.Member;

import java.util.List;

public interface MemberRepositoryCustom {
    List<Member> searchMembers(MemberSearchCondition condition);
}
