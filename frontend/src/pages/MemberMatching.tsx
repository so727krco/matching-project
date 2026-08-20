import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, X } from 'lucide-react';

import { getMatches, setMatches, getMembers, getCurrentUser } from '../utils/storage';
import { usePopup } from '../contexts/PopupContext';

export default function MemberMatching() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();
  const [isMatching, setIsMatching] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [maleCount, setMaleCount] = useState<number>(2);
  const [femaleCount, setFemaleCount] = useState<number>(2);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
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
    
    const form = e.target as HTMLFormElement;
    const theme1 = (form.elements.namedItem('theme1') as HTMLInputElement)?.value || '';
    const theme2 = (form.elements.namedItem('theme2') as HTMLInputElement)?.value || '';
    const theme3 = (form.elements.namedItem('theme3') as HTMLInputElement)?.value || '';
    
    const themes = [theme1, theme2, theme3].filter(t => t.trim() !== '');
    if (themes.length === 0) return;
    
    setSelectedThemes(themes);
    setIsConfigModalOpen(true);
  };

  
  const executeMatch = async () => {
    setIsConfigModalOpen(false);
    setIsMatching(true);
    
    try {
        const response = await fetch('http://localhost:8080/api/matching/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topics: selectedThemes,
                maleCount: maleCount,
                femaleCount: femaleCount,
                managerName: getCurrentUser()
            })
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const allMembers = getMembers();
        const matchedMembers: any[] = [];
        
        
        const processCandidate = (candidate: any) => {
            let fullMember = allMembers.find((m: any) => m.id === candidate.memberId);
            if (!fullMember) {
                fullMember = {
                    id: candidate.memberId,
                    name: candidate.name,
                    gender: candidate.gender === 'M' ? '남성' : '여성',
                    age: candidate.age,
                    job: '미상 (DB회원)',
                    income: 0,
                    hobby: 'DB 매칭 회원',
                    idealType: '시스템 추천',
                    intro: 'AI 매칭을 통해 추천된 회원입니다.',
                    managerName: getCurrentUser()
                };
            }
            matchedMembers.push({
                ...fullMember,
                approvalStatus: fullMember.managerName === getCurrentUser() ? 'approved' : 'pending',
                paymentStatus: 'UNPAID',
                diffScore: candidate.diffScore
            });
        };
        
        data.males.forEach(processCandidate);
        data.females.forEach(processCandidate);
        
        const newMatch = {
          id: Date.now(),
          title: `AI 매칭: ${selectedThemes.join(', ')}`,
          date: new Date().toISOString().split('T')[0],
          themes: selectedThemes,
          managerName: getCurrentUser(),
          members: matchedMembers
        };
        
        const matches = getMatches();
        setMatches([newMatch, ...matches]);
        
        showAlert(`매칭이 완료되었습니다! (총 ${matchedMembers.length}명 추출)`, () => {
          navigate('/manage');
        });
    } catch (err) {
        console.error("매칭 생성 중 오류:", err);
        showAlert('매칭에 실패했습니다. 백엔드 서버를 확인해주세요.');
    } finally {
        setIsMatching(false);
    }
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
                매칭 설정하기
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary btn-full btn-lg"
                disabled
              >
                AI 매칭 진행 중...
              </button>
            )}
          </form>
        </div>
      </main>

      {/* Config Modal */}
      {isConfigModalOpen && (
        <div className="modal-overlay" onClick={() => setIsConfigModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">추출 인원 설정</h3>
              <button className="close-button" onClick={() => setIsConfigModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="text-secondary text-sm mb-6">설정한 인원만큼 AI가 최적의 매칭을 찾아 추출합니다.</p>
              
              <div className="form-group mb-4">
                <label className="form-label">남성 추출 인원</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="0" max="100"
                  value={maleCount}
                  onChange={(e) => setMaleCount(Number(e.target.value))}
                />
              </div>
              
              <div className="form-group mb-8">
                <label className="form-label">여성 추출 인원</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="0" max="100"
                  value={femaleCount}
                  onChange={(e) => setFemaleCount(Number(e.target.value))}
                />
              </div>
              
              <div className="flex justify-center gap-3">
                <button type="button" className="btn btn-primary" onClick={executeMatch}>
                  확인 (매칭 실행)
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setIsConfigModalOpen(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
