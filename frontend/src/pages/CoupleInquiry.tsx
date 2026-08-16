import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X, Heart } from 'lucide-react';
import { getCouples, setCouples as saveCouples, getMatches, type Couple, type Match } from '../utils/storage';
import { usePopup } from '../contexts/PopupContext';

export default function CoupleInquiry() {
  const navigate = useNavigate();
  const [couples, setCouples] = useState<Couple[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [selectedCouple, setSelectedCouple] = useState<Couple | null>(null);
  const { showConfirm } = usePopup();

  useEffect(() => {
    setCouples(getCouples());
    setAllMatches(getMatches());
  }, []);

  const getSharedMatches = (couple: Couple) => {
    return allMatches.filter(match => 
      match.members.some(m => m.id === couple.member1.id) &&
      match.members.some(m => m.id === couple.member2.id)
    );
  };

  const handleBreakup = (coupleId: number) => {
    showConfirm('정말로 커플을 해제하시겠습니까? 해제된 회원은 다시 솔로 리스트에 나타납니다.', () => {
      const updatedCouples = couples.filter(c => c.id !== coupleId);
      setCouples(updatedCouples);
      saveCouples(updatedCouples);
      setSelectedCouple(null);
    });
  };

  return (
    <div className="app-container bg-gray-50">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate('/main')}>
          <ChevronLeft size={20} />
          <span>메인으로</span>
        </button>
        <div className="app-title text-base">커플조회</div>
        <div style={{ width: '80px' }}></div>
      </header>
      
      <main className="main-content">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl mb-2">커플 리스트</h2>
            <p className="text-secondary text-sm">성사된 커플 목록입니다.</p>
          </div>
        </div>

        <div className="list-container">
          {couples.length === 0 && (
            <div className="text-center text-secondary py-12">
              <Heart size={48} className="mx-auto mb-4 opacity-20" />
              <p>아직 성사된 커플이 없습니다.</p>
              <p className="text-sm mt-2">회원조회 메뉴에서 커플을 등록할 수 있습니다.</p>
            </div>
          )}
          {couples.map((couple) => (
            <div 
              key={couple.id} 
              className="list-item card"
              style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setSelectedCouple(couple)}
            >
              <div className="flex items-center gap-6 w-full justify-center">
                <div className="text-center">
                  <div className="font-semibold text-lg">{couple.member1.name}</div>
                  <div className="text-xs text-secondary">{couple.member1.gender}, {couple.member1.age}세</div>
                </div>
                
                <div style={{ color: 'var(--color-danger)' }}>
                  <Heart size={32} fill="currentColor" />
                </div>

                <div className="text-center">
                  <div className="font-semibold text-lg">{couple.member2.name}</div>
                  <div className="text-xs text-secondary">{couple.member2.gender}, {couple.member2.age}세</div>
                </div>
              </div>
              <div className="text-xs text-secondary mt-2 text-center absolute bottom-2 right-4">
                등록일: {couple.date}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Couple Detail Modal */}
      {selectedCouple && (
        <div className="modal-overlay" style={{ zIndex: 70 }} onClick={() => setSelectedCouple(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">커플 상세 이력</h3>
              <button className="close-button" onClick={() => setSelectedCouple(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="flex items-center gap-6 w-full justify-center mb-6" style={{ backgroundColor: '#fff1f2', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div className="text-center">
                  <div className="font-bold text-xl">{selectedCouple.member1.name}</div>
                  <div className="text-sm text-secondary">{selectedCouple.member1.job}</div>
                </div>
                
                <div style={{ color: 'var(--color-danger)' }}>
                  <Heart size={32} fill="currentColor" />
                </div>

                <div className="text-center">
                  <div className="font-bold text-xl">{selectedCouple.member2.name}</div>
                  <div className="text-sm text-secondary">{selectedCouple.member2.job}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-secondary mb-3">두 사람이 함께 참석한 매칭 이력</h4>
                <div className="list-container gap-2">
                  {getSharedMatches(selectedCouple).length === 0 ? (
                    <div className="text-center text-secondary py-4 text-sm bg-gray-50 rounded-lg">
                      함께 참석한 매칭 기록이 없습니다.
                    </div>
                  ) : (
                    getSharedMatches(selectedCouple).map(match => (
                      <div key={match.id} className="card list-item" style={{ padding: '1rem' }}>
                        <div className="font-semibold mb-1">{match.title}</div>
                        <div className="text-sm text-secondary mb-2">{match.date} • {match.members.length}명 참여</div>
                        <div className="flex gap-1 flex-wrap">
                          {match.themes && match.themes.map((theme: string, idx: number) => (
                            <span key={idx} className="badge bg-primary-light text-primary" style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                              #{theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button 
                  className="btn btn-danger btn-outline text-sm"
                  onClick={() => handleBreakup(selectedCouple.id)}
                >
                  💔 커플 해제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
