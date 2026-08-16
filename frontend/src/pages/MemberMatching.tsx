import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { getMatches, setMatches, getMembers, getCurrentUser } from '../utils/storage';
import { usePopup } from '../contexts/PopupContext';

export default function MemberMatching() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();
  const [isMatching, setIsMatching] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리 (메모리 누수 방지 및 예기치 않은 실행 방지)
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatching) return;
    
    setIsMatching(true);
    
    // 폼에서 입력한 주제 미리 가져오기
    const form = e.target as HTMLFormElement;
    const theme1 = (form.elements.namedItem('theme1') as HTMLInputElement)?.value || '';
    const theme2 = (form.elements.namedItem('theme2') as HTMLInputElement)?.value || '';
    const theme3 = (form.elements.namedItem('theme3') as HTMLInputElement)?.value || '';
    
    const themes = [theme1, theme2, theme3].filter(t => t.trim() !== '');
    
    // 브라우저 내장 window.setTimeout 사용
    timerRef.current = window.setTimeout(() => {
      try {
        const matches = getMatches();
        const members = getMembers();
        const currentUser = getCurrentUser();
        
        const myMembers = members.filter((m: any) => m.managerName === currentUser);
        const otherMembers = members.filter((m: any) => m.managerName !== currentUser);
        
        if (myMembers.length > 0 && otherMembers.length > 0) {
          const newMatch = {
            id: Date.now(),
            title: `AI 추천 매칭: ${themes.join(', ')}`,
            date: new Date().toISOString().split('T')[0],
            themes: themes,
            managerName: currentUser,
            members: [
              { ...myMembers[0], approvalStatus: 'approved' as const },
              { ...otherMembers[0], approvalStatus: 'pending' as const }
            ]
          };
          setMatches([...matches, newMatch]);
        }
      } catch (err) {
        console.error("매칭 생성 중 오류:", err);
      }
      
      setIsMatching(false);
      showAlert('매칭이 완료되었습니다! 매칭 관리에서 확인해주세요.', () => {
        navigate('/manage');
      });
    }, 2500);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsMatching(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate('/main')}>
          <ChevronLeft size={20} />
          <span>메인으로</span>
        </button>
        <div className="app-title text-base">회원매칭</div>
        <div style={{ width: '80px' }}></div>
      </header>
      
      <main className="main-content">
        <div className="card">
          <div className="flex justify-center mb-4 text-primary">
            <Sparkles size={48} color="var(--color-primary)" />
          </div>
          <h2 className="text-2xl mb-2 text-center">AI 테마 매칭</h2>
          <p className="text-secondary text-sm text-center mb-8">
            원하시는 매칭 주제를 최대 3가지 입력해주세요. <br/>
            AI가 최적의 인연을 찾아드립니다.
          </p>
          
          <form onSubmit={handleMatch}>
            <div className="form-group">
              <label className="form-label" htmlFor="theme1">첫 번째 주제 (필수)</label>
              <input 
                type="text" 
                id="theme1" 
                className="form-input" 
                placeholder="예: 같은 직종" 
                disabled={isMatching}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="theme2">두 번째 주제 (선택)</label>
              <input 
                type="text" 
                id="theme2" 
                className="form-input" 
                placeholder="예: 활동적인 취미" 
                disabled={isMatching}
              />
            </div>

            <div className="form-group mb-8">
              <label className="form-label" htmlFor="theme3">세 번째 주제 (선택)</label>
              <input 
                type="text" 
                id="theme3" 
                className="form-input" 
                placeholder="예: 동갑내기" 
                disabled={isMatching}
              />
            </div>
            
            {!isMatching ? (
              <button 
                type="submit" 
                className="btn btn-primary btn-full btn-lg"
              >
                매칭 시작하기
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-danger btn-full btn-lg"
                style={{ backgroundColor: '#ef4444', color: 'white' }}
                onClick={handleCancel}
              >
                매칭 취소하기
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
