package com.matching.backmgr.repository;

import com.matching.backmgr.dto.MemberSearchCondition;
import com.matching.backmgr.entity.Member;
import com.matching.backmgr.entity.QMember;
import com.matching.backmgr.entity.QManager;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

import java.util.List;

@RequiredArgsConstructor
public class MemberRepositoryCustomImpl implements MemberRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Member> searchMembers(MemberSearchCondition condition) {
        QMember member = QMember.member;
        QManager manager = QManager.manager;

        return queryFactory
                .selectFrom(member)
                .leftJoin(member.manager, manager).fetchJoin()
                .where(
                        nameContains(condition.getName()),
                        genderEq(condition.getGender()),
                        ageGoe(condition.getMinAge()),
                        ageLoe(condition.getMaxAge()),
                        salaryGoe(condition.getMinSalary()),
                        managerEmpNoEq(condition.getManagerEmpNo())
                )
                .fetch();
    }

    private BooleanExpression nameContains(String name) {
        return StringUtils.hasText(name) ? QMember.member.name.contains(name) : null;
    }

    private BooleanExpression genderEq(String gender) {
        if (!StringUtils.hasText(gender) || "전체".equals(gender)) {
            return null;
        }
        // Assuming gender is stored as "M" or "F" or directly as "남성"/"여성". 
        // Our DTO or frontend can send standard values.
        return QMember.member.gender.eq(gender);
    }

    private BooleanExpression ageGoe(Integer minAge) {
        return minAge != null ? QMember.member.age.goe(minAge) : null;
    }

    private BooleanExpression ageLoe(Integer maxAge) {
        return maxAge != null ? QMember.member.age.loe(maxAge) : null;
    }

    private BooleanExpression salaryGoe(Integer minSalary) {
        return minSalary != null ? QMember.member.salary.goe(minSalary) : null;
    }

    private BooleanExpression managerEmpNoEq(String managerEmpNo) {
        return StringUtils.hasText(managerEmpNo) ? QManager.manager.empNo.eq(managerEmpNo) : null;
    }
}
