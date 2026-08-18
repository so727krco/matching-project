import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, HeartHandshake, List, LogOut, Search, ShieldAlert } from 'lucide-react';

import { usePopup } from '../contexts/PopupContext';



export default function MainScreen() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const managerName = localStorage.getItem('managerName') || '매니저';

  useEffect(() => {
    const managerId = localStorage.getItem('managerId');
    if (managerId) {
      fetch('http://localhost:8080/api/approvals?managerId=' + managerId)
        .then(res => res.json())
        .then(data => {
          const count = data.filter((req: any) => req.status === 'PENDING').length;
          setPendingApprovals(count);
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const handleAdminClick = async () => {
    const managerId = localStorage.getItem('managerId');
    if (!managerId) {
      showAlert('로그인이 필요합니다.');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/managers/${managerId}/is-admin`);
      if (!response.ok) throw new Error('권한 확인 실패');
      
      const isAdmin = await response.json();
      if (!isAdmin) {
        showAlert('관리자가 아닙니다.');
        return;
      }
      navigate('/admin');
    } catch (error) {
      showAlert('관리자 권한을 확인할 수 없습니다.');
    }
  };

  return (
    <div className="app-container bg-gray-50">
      <header className="app-header">
        <div className="app-title">
          <HeartHandshake size={24} />
          HeartSync Admin
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', borderColor: '#475569', color: '#475569' }} onClick={handleAdminClick}>
            <span className="text-sm">관리자 화면</span>
          </button>
          <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }} onClick={handleLogout}>
            <LogOut size={16} />
            <span className="text-sm">로그아웃</span>
          </button>
        </div>
      </header>
      
      <main className="main-content" style={{ justifyContent: 'center' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">환영합니다, {managerName}님!</h1>
          <p className="text-secondary">원하시는 관리 메뉴를 선택해주세요.</p>
        </div>

        <div className="flex flex-col gap-4 max-w-md w-full mx-auto" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <button 
            className="card flex items-center justify-between hover:bg-surface-hover" 
            style={{ textAlign: 'left', cursor: 'pointer', padding: '1.5rem' }}
            onClick={() => navigate('/register')}
          >
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">회원등록</h3>
                <p className="text-secondary text-sm">새로운 회원을 시스템에 등록합니다.</p>
              </div>
            </div>
          </button>

          <button 
            className="card flex items-center justify-between hover:bg-surface-hover" 
            style={{ textAlign: 'left', cursor: 'pointer', padding: '1.5rem' }}
            onClick={() => navigate('/members')}
          >
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: 'hsl(210, 80%, 95%)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-info)' }}>
                <Search size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">회원조회</h3>
                <p className="text-secondary text-sm">등록된 전체 회원 목록과 상세 정보를 조회합니다.</p>
              </div>
            </div>
          </button>

          <button 
            className="card flex items-center justify-between hover:bg-surface-hover" 
            style={{ textAlign: 'left', cursor: 'pointer', padding: '1.5rem' }}
            onClick={() => navigate('/couples')}
          >
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: 'hsl(280, 80%, 95%)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
                <HeartHandshake size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">커플조회</h3>
                <p className="text-secondary text-sm">성사된 커플 목록과 매칭 이력을 조회합니다.</p>
              </div>
            </div>
          </button>

          <button 
            className="card flex items-center justify-between hover:bg-surface-hover" 
            style={{ textAlign: 'left', cursor: 'pointer', padding: '1.5rem' }}
            onClick={() => navigate('/matching')}
          >
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: 'hsl(350, 80%, 95%)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-danger)' }}>
                <HeartHandshake size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">회원매칭</h3>
                <p className="text-secondary text-sm">주제를 기반으로 최적의 인연을 찾습니다.</p>
              </div>
            </div>
          </button>

          <button 
            className="card flex items-center justify-between hover:bg-surface-hover" 
            style={{ textAlign: 'left', cursor: 'pointer', padding: '1.5rem' }}
            onClick={() => navigate('/manage')}
          >
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: 'hsl(150, 80%, 95%)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-success)' }}>
                <List size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">매칭관리</h3>
                <p className="text-secondary text-sm">매칭된 회원 목록을 확인하고 관리합니다.</p>
              </div>
            </div>
          </button>

          <button 
            className="card flex items-center justify-between hover:bg-surface-hover" 
            style={{ textAlign: 'left', cursor: 'pointer', padding: '1.5rem', position: 'relative' }}
            onClick={() => navigate('/approvals')}
          >
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: '#f3e8ff', padding: '0.75rem', borderRadius: '50%', color: '#9333ea' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">승인관리</h3>
                <p className="text-secondary text-sm">타 담당자 회원의 권한 및 매칭을 승인합니다.</p>
              </div>
            </div>
            {pendingApprovals > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {pendingApprovals}
              </div>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
