import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart3, Users, HeartHandshake, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';
import { getMembers, getMatches, getCouples } from '../utils/storage';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCouples: 0,
    managerStats: [] as any[],
    matchSuccessRate: 0,
  });

  useEffect(() => {
    const members = getMembers();
    const couples = getCouples();
    const matches = getMatches();

    const totalMembers = members.length;
    const totalCouples = couples.length;

    // 매니저별 통계 계산
    // Extract distinct managers from member list
    const managers = Array.from(new Set(members.map(m => m.managerName).filter(Boolean)));
    const managerStats = managers.map(manager => {
      // 해당 매니저가 담당하는 회원 수
      const managedMembers = members.filter(m => m.managerName === manager).length;
      
      // 해당 매니저가 담당하는 회원 중 커플이 된 수 (member1 또는 member2가 해당 매니저 담당일 경우)
      let couplesCount = 0;
      couples.forEach(c => {
        if (c.member1.managerName === manager) couplesCount += 0.5;
        if (c.member2.managerName === manager) couplesCount += 0.5;
      });

      const successRate = managedMembers > 0 ? Math.round((couplesCount / managedMembers) * 100) : 0;

      return {
        manager,
        managedMembers,
        couplesCount,
        successRate
      };
    });

    // 매칭 성공률: 전체 생성된 매칭 대비 실제로 커플이 탄생한 매칭 비율 (단순 목업 계산)
    // 여기서는 단순히 전체 커플 수 / 전체 매칭 수로 대략적인 성공률을 표기합니다.
    const matchSuccessRate = matches.length > 0 ? Math.min(100, Math.round((totalCouples / matches.length) * 100)) : 0;

    setStats({
      totalMembers,
      totalCouples,
      managerStats,
      matchSuccessRate
    });
  }, []);

  return (
    <div className="app-container bg-gray-50">
      <header className="app-header" style={{ backgroundColor: '#1e293b', color: 'white' }}>
        <button className="back-button" onClick={() => navigate('/main')} style={{ color: '#cbd5e1' }}>
          <ChevronLeft size={20} />
          <span>메인으로</span>
        </button>
        <div className="app-title text-base">
          <BarChart3 size={20} className="mr-2" />
          관리자 대시보드
        </div>
        <div style={{ width: '80px' }}></div>
      </header>
      
      <main className="main-content" style={{ padding: '1.5rem' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">비즈니스 통계</h2>
          <p className="text-secondary text-sm">전체 서비스 운영 현황을 한눈에 파악하세요.</p>
        </div>

        {/* Actions */}
        <button 
          className="card flex items-center justify-between hover-card" 
          style={{ padding: '1.25rem', cursor: 'pointer', textAlign: 'left', border: 'none', background: 'white', width: '100%', marginBottom: '2rem' }}
          onClick={() => navigate('/admin/history')}
        >
          <div className="flex items-center gap-4">
            <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '50%', color: '#d97706' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">매칭 이력(로그) 조회</h3>
              <p className="text-sm text-secondary">AI 매칭 시도 내역과 키워드 변환 로그를 열람합니다.</p>
            </div>
          </div>
          <ChevronRight className="text-secondary" />
        </button>

        {/* Top KPIs */}
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#eff6ff', border: 'none' }}>
            <div className="flex items-center gap-3 mb-2" style={{ color: '#1e40af' }}>
              <Users size={24} />
              <div className="font-semibold">누적 가입자</div>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#1e3a8a' }}>{stats.totalMembers}명</div>
          </div>
          
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fdf2f8', border: 'none' }}>
            <div className="flex items-center gap-3 mb-2" style={{ color: '#be185d' }}>
              <HeartHandshake size={24} />
              <div className="font-semibold">누적 커플</div>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#831843' }}>{stats.totalCouples}쌍</div>
          </div>
        </div>

        {/* Manager Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
            매니저별 커플 성사율
          </h3>
          <div className="list-container gap-3">
            {stats.managerStats.map((stat, idx) => (
              <div key={idx} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-lg">{stat.manager}</div>
                  <div className="text-sm font-bold" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                    성사율 {stat.successRate}%
                  </div>
                </div>
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div className="text-xs text-secondary mb-1">담당 회원 수</div>
                    <div className="font-medium">{stat.managedMembers}명</div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary mb-1">성사시킨 커플 수</div>
                    <div className="font-medium">{stat.couplesCount}쌍</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match Success Rate */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} style={{ color: 'var(--color-info)' }} />
            전체 매칭 성공률
          </h3>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="flex justify-between items-end mb-2">
              <div className="text-secondary text-sm">매칭 이벤트 대비 커플 성사 비율</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>{stats.matchSuccessRate}%</div>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.matchSuccessRate}%`, height: '100%', backgroundColor: 'var(--color-info)', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
