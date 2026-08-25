import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, UserMinus, Plus, Trash2, X, UserPlus } from 'lucide-react';
import { getMatches, setMatches as saveMatches, getMembers, getCouples, type Match, type MatchMember, type Member } from '../utils/storage';
import { getCurrentUser } from '../utils/storage';
import { usePopup } from '../contexts/PopupContext';

// Mock Data
const getMockScore = (matchId: number, memberId: number) => {
  return 60 + ((matchId * 17 + memberId * 11) % 41); // Generates 60~100 randomly
};

const renderScoreBadge = (score: number, opacity: number = 1) => {
  let bgColor, textColor, extraContent;
  
  if (score >= 90) {
    bgColor = '#fee2e2';
    textColor = '#991b1b';
    extraContent = '❤️';
  } else if (score >= 80) {
    bgColor = '#dcfce7';
    textColor = '#166534';
    extraContent = '';
  } else if (score >= 70) {
    bgColor = 'transparent';
    textColor = '#4b5563';
    extraContent = '';
  } else {
    bgColor = '#dbeafe';
    textColor = '#1e40af';
    extraContent = '';
  }

  const borderStyle = (score >= 70 && score < 80) ? '1px solid #e5e7eb' : '1px solid transparent';

  return (
    <div className="text-center" style={{ backgroundColor: bgColor, color: textColor, padding: '0.5rem', borderRadius: 'var(--radius-md)', minWidth: '70px', border: borderStyle, opacity }}>
      <div className="text-xs font-semibold">매칭점수</div>
      <div className="font-bold text-lg flex items-center justify-center gap-1">
        {extraContent && <span style={{ fontSize: '0.9rem' }}>{extraContent}</span>}
        <span>{score}점</span>
      </div>
    </div>
  );
};

export default function MatchingManagement() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/matching/history')
      .then(res => res.json())
      .then(history => {
        const localMatches = getMatches();
        let updated = false;
        const historyReversed = [...history].reverse();
        const mergedMatches = localMatches.map((m, idx) => {
          if (!m.extractedTargets && historyReversed[idx] && historyReversed[idx].extractedTargets) {
            updated = true;
            return { ...m, extractedTargets: historyReversed[idx].extractedTargets };
          }
          return m;
        });
        if (updated) {
          setMatches(mergedMatches);
          saveMatches(mergedMatches);
        }
      })
      .catch(e => console.error('History fetch failed', e));
  }, []);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  const { showAlert, showConfirm } = usePopup();
  const [newMatchTitle, setNewMatchTitle] = useState('');
  const [newMatchThemes, setNewMatchThemes] = useState<string[]>(['', '', '']);
  const [maleCount, setMaleCount] = useState<number>(2);
  const [femaleCount, setFemaleCount] = useState<number>(2);
  const [isMatching, setIsMatching] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [memberTraits, setMemberTraits] = useState<Record<string, number> | null>(null);
  const [showTraits, setShowTraits] = useState(false);
  
  const handleCloseDetailMember = () => {
    setDetailMember(null);
    setShowTraits(false);
    setMemberTraits(null);
  };
  
  const handleShowTraits = async () => {
    if (!detailMember) return;
    try {
      const response = await fetch(`http://localhost:8080/api/members/${detailMember.id}/traits`);
      if (response.ok) {
        const data = await response.json();
        setMemberTraits(data);
        setShowTraits(show => !show);
      } else {
        alert('AI 성향 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('AI 성향 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };
  const [includeOtherManagers, setIncludeOtherManagers] = useState(false);

  useEffect(() => {
    setMatches(getMatches());
    
    // Fetch all members from backend
    const fetchAvailableMembers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/members/search');
        if (response.ok) {
          const members = await response.json();
          const couples = getCouples();
          const availableMembers = members.filter((m: any) => 
            !couples.some(c => c.member1.id === m.id || c.member2.id === m.id)
          );
          setAllMembers(availableMembers);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };

    fetchAvailableMembers();
  }, []);

  const handleViewMemberDetail = async (member: any) => {
    try {
      const response = await fetch(`http://localhost:8080/api/members/${member.id}`);
      if (response.ok) {
        const data = await response.json();
        setDetailMember({ ...data, diffScore: member.diffScore, approvalStatus: member.approvalStatus });
      } else {
        setDetailMember(member);
      }
    } catch (e) {
      setDetailMember(member);
    }
  };

  const handleRemoveMember = (matchId: number, memberId: number) => {
    // 실제로는 백엔드 API를 호출합니다.
    showConfirm('이 회원을 현재 매칭에서 삭제하시겠습니까?', () => {
      const updatedMatches = matches.map(match => {
        if (match.id === matchId) {
          return { ...match, members: match.members.filter(m => m.id !== memberId) };
        }
        return match;
      });
      setMatches(updatedMatches);
      saveMatches(updatedMatches);
      
      if (selectedMatch) {
        setSelectedMatch({
          ...selectedMatch,
          members: selectedMatch.members.filter((m) => m.id !== memberId)
        });
      }
    });
  };

  const confirmDeleteMatch = (matchId: number) => {
    setMatchToDelete(matchId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteMatch = () => {
    if (matchToDelete !== null) {
      const updatedMatches = matches.filter(m => m.id !== matchToDelete);
      setMatches(updatedMatches);
      saveMatches(updatedMatches);
      setIsDeleteModalOpen(false);
      setMatchToDelete(null);
    }
  };

  const handleTogglePayment = (matchId: number, memberId: number) => {
    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        const updatedMembers = match.members.map(m => {
          if (m.id === memberId) {
            return { ...m, paymentStatus: m.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID' } as MatchMember;
          }
          return m;
        });
        return { ...match, members: updatedMembers };
      }
      return match;
    });
    setMatches(updatedMatches);
    saveMatches(updatedMatches);
    
    if (selectedMatch) {
      const updatedSelectedMembers = selectedMatch.members.map((m: MatchMember) => {
        if (m.id === memberId) {
          return { ...m, paymentStatus: m.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID' } as MatchMember;
        }
        return m;
      });
      setSelectedMatch({
        ...selectedMatch,
        members: updatedSelectedMembers
      });
    }
  };

  const handleOpenAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleConfirmAddMember = (member: any) => {
    if (!selectedMatch) return;
    
    // 중복 체크
    if (selectedMatch.members.some((m: any) => m.id === member.id)) {
      showAlert('이미 이 매칭에 포함된 회원입니다.');
      return;
    }

    const matchMember: MatchMember = {
      ...member,
      approvalStatus: member.managerName === getCurrentUser() ? 'approved' : 'pending'
    };

    const updatedMatches = matches.map(match => {
      if (match.id === selectedMatch?.id) {
        return { ...match, members: [...match.members, matchMember] };
      }
      return match;
    });
    setMatches(updatedMatches);
    saveMatches(updatedMatches);
    
    if (selectedMatch) {
      setSelectedMatch({
        ...selectedMatch,
        members: [...selectedMatch.members, matchMember]
      });
    }

    setIsAddModalOpen(false);
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchTitle.trim()) return;
    
    setIsMatching(true);
    try {
        const response = await fetch('http://localhost:8080/api/matching/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topics: newMatchThemes.filter(t => t.trim() !== ''),
                maleCount: maleCount,
                femaleCount: femaleCount,
                managerName: getCurrentUser()
            })
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        
        // Find full member details from local storage members based on matched IDs
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
                    managerName: getCurrentUser() // Default to current user for demo
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
        
        const newMatch: Match = {
          id: Date.now(),
          title: newMatchTitle,
          date: new Date().toISOString().split('T')[0],
          themes: newMatchThemes.filter(t => t.trim() !== ''),
          managerName: getCurrentUser(),
          members: matchedMembers,
          extractedTargets: data.extractedTargets
        };
        
        const updatedMatches = [newMatch, ...matches];
        setMatches(updatedMatches);
        saveMatches(updatedMatches);
        
        setNewMatchTitle('');
        setNewMatchThemes(['', '', '']);
        setMaleCount(2);
        setFemaleCount(2);
        setIsCreateMatchModalOpen(false);
        showAlert(`매칭이 완료되었습니다! (총 ${matchedMembers.length}명 추출)`);
    } catch (err) {
        console.error(err);
        showAlert('매칭에 실패했습니다. 백엔드 서버를 확인해주세요.');
    } finally {
        setIsMatching(false);
    }
  };

  return (
    <div className="app-container bg-gray-50">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate('/main')}>
          <ChevronLeft size={20} />
          <span>메인으로</span>
        </button>
        <div className="app-title text-base">매칭관리</div>
        <div style={{ width: '80px' }}></div>
      </header>
      
      <main className="main-content">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl mb-2">매칭 리스트</h2>
            <p className="text-secondary text-sm">최근 생성된 매칭 결과 목록입니다.</p>
          </div>
          <button 
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
            onClick={() => setIsCreateMatchModalOpen(true)}
          >
            <Plus size={16} />
            새 매칭 추가
          </button>
        </div>

        <div className="list-container">
          {matches.map((match) => (
            <div 
              key={match.id} 
              className="list-item flex justify-between items-center"
            >
              <div 
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => setSelectedMatch(match)}
              >
                <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
                  <Users size={20} />
                </div>
                <div className="list-item-content">
                  <span className="list-item-title">{match.title}</span>
                  <span className="list-item-subtitle mb-2">{match.date} • {match.members.length}명 참여</span>
                  <div className="flex gap-1 flex-wrap">
                    {match.themes && match.themes.map((theme: string, idx: number) => (
                      <span key={idx} className="badge" style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                        #{theme}
                      </span>
                    ))}
                  </div>
                    {match.extractedTargets && Object.keys(match.extractedTargets).length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {Object.entries(match.extractedTargets).map(([k, v]) => (
                          <span key={k} className="badge bg-gray-100 text-gray-700" style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              
              <button 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-4"
                onClick={(e) => { e.stopPropagation(); confirmDeleteMatch(match.id); }}
                title="매칭 삭제"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div>
                <h3 className="text-lg font-semibold">{selectedMatch.title} 상세</h3>
                {selectedMatch.managerName && (
                  <div className="text-xs text-secondary mt-1">매칭 등록 담당자: {selectedMatch.managerName}</div>
                )}
              </div>
              <button className="close-button" onClick={() => setSelectedMatch(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-4">
                <div className="flex gap-1 flex-wrap mb-2">
                  {selectedMatch.themes && selectedMatch.themes.map((theme: string, idx: number) => (
                    <span key={idx} className="badge" style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                      #{theme}
                    </span>
                  ))}
                </div>
                  {selectedMatch.extractedTargets && Object.keys(selectedMatch.extractedTargets).length > 0 && (
                      <div style={{ backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #c7d2fe' }}>
                        <h4 className="font-bold text-indigo-900 mb-2">🤖 AI 추출 매칭 기준</h4>
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                          {Object.entries(selectedMatch.extractedTargets).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-sm" style={{ backgroundColor: Number(value) > 90 ? '#fee2e2' : Number(value) >= 80 ? '#fef9c3' : 'white', padding: '0.4rem', borderRadius: '4px', border: Number(value) > 90 ? '1px solid #fecaca' : Number(value) >= 80 ? '1px solid #fef08a' : '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                              <span className={Number(value) > 90 ? "text-red-800 font-medium" : Number(value) >= 80 ? "text-yellow-800 font-medium" : "text-gray-700"}>{key}</span>
                              <span className={`font-bold ${Number(value) > 90 ? "text-red-600" : Number(value) >= 80 ? "text-yellow-700" : "text-indigo-600"}`}>{value as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-secondary">참여 회원 (점수 순)</h4>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: 'var(--font-size-xs)' }}
                  onClick={handleOpenAddMember}
                >
                  <UserPlus size={14} />
                  회원 추가
                </button>
              </div>
              
              <div className="list-container gap-2">
                {selectedMatch.members.length === 0 && (
                  <div className="text-center text-secondary py-4 text-sm">참여 중인 회원이 없습니다.</div>
                )}
                {selectedMatch.members.map((member: any) => (
                  <div 
                    key={member.id} 
                    className="card list-item" 
                    style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => handleViewMemberDetail(member)}
                  >
                    <div className="flex gap-4 items-center">
                      {renderScoreBadge(parseInt(((member as any).diffScore ? (100 - ((member as any).diffScore / 10)) : getMockScore(selectedMatch.id, member.id)).toFixed(0), 10))}
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {member.name} 
                          <span className="text-sm font-normal text-secondary">({member.gender}, {member.age}세)</span>
                          {member.approvalStatus === 'pending' && (
                            <span className="badge bg-yellow-100 text-yellow-800" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: '#fef9c3', color: '#854d0e', borderRadius: '4px' }}>
                              타 담당자 승인 대기중
                            </span>
                          )}
                          {member.paymentStatus === 'PAID' ? (
                            <span className="badge bg-green-100 text-green-800" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: '#dcfce3', color: '#166534', borderRadius: '4px' }}>
                              결제 완료
                            </span>
                          ) : (
                            <span className="badge bg-gray-100 text-gray-800" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '4px' }}>
                              입금 대기중
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-secondary">{member.job}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`btn ${member.paymentStatus === 'PAID' ? 'btn-outline' : 'btn-primary'}`}
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          fontSize: 'var(--font-size-xs)',
                          opacity: member.approvalStatus === 'pending' ? 0.5 : 1,
                          cursor: member.approvalStatus === 'pending' ? 'not-allowed' : 'pointer'
                        }}
                        disabled={member.approvalStatus === 'pending'}
                        onClick={() => handleTogglePayment(selectedMatch.id, member.id)}
                        title={member.approvalStatus === 'pending' ? "승인 대기 중에는 결제 상태를 변경할 수 없습니다." : ""}
                      >
                        {member.paymentStatus === 'PAID' ? '결제 취소' : '결제 완료'}
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', opacity: member.paymentStatus === 'PAID' ? 0.5 : 1, cursor: member.paymentStatus === 'PAID' ? 'not-allowed' : 'pointer' }}
                        disabled={member.paymentStatus === 'PAID'}
                        onClick={() => {
                          if (member.paymentStatus === 'PAID') {
                            showAlert('결제가 완료된 회원은 삭제할 수 없습니다. 결제를 취소한 후 시도해주세요.');
                            return;
                          }
                          handleRemoveMember(selectedMatch.id, member.id);
                        }}
                        title={member.paymentStatus === 'PAID' ? "결제 완료된 회원" : "매칭에서 제외"}
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Sub-Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">회원 선택</h3>
              <button className="close-button" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="flex justify-between items-center mb-4">
                <p className="text-secondary text-sm">이 매칭에 추가할 회원을 선택해주세요.</p>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeOtherManagers} 
                    onChange={(e) => setIncludeOtherManagers(e.target.checked)} 
                  />
                  <span>타 담당자 회원 포함하기</span>
                </label>
              </div>
              
              <div className="list-container gap-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {allMembers
                  .filter(m => includeOtherManagers || m.managerName === getCurrentUser())
                  .map((member) => {
                  const isAlreadyAdded = selectedMatch?.members.some((m: any) => m.id === member.id);
                  
                  return (
                    <div 
                      key={member.id} 
                      className="list-item card" 
                      style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isAlreadyAdded ? 'not-allowed' : 'pointer', opacity: isAlreadyAdded ? 0.5 : 1, marginBottom: '0.5rem' }}
                      onClick={() => !isAlreadyAdded && handleConfirmAddMember(member)}
                    >
                      <div className="flex gap-4 items-center">
                        {selectedMatch && renderScoreBadge(parseInt(((member as any).diffScore ? (100 - ((member as any).diffScore / 10)) : getMockScore(selectedMatch.id, member.id)).toFixed(0), 10), isAlreadyAdded ? 0.5 : 1)}
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {member.name} <span className="text-sm font-normal text-secondary">({member.gender}, {member.age}세)</span>
                            {member.managerName !== getCurrentUser() && (
                              <span className="badge" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '4px' }}>
                                {member.managerName}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-secondary">{member.job}</div>
                        </div>
                      </div>
                      <div className="text-primary text-sm font-semibold">
                        {isAlreadyAdded ? '추가됨' : '선택'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Match Modal */}
      {isCreateMatchModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateMatchModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">새 매칭 추가</h3>
              <button className="close-button" onClick={() => setIsCreateMatchModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleCreateMatch}>
                <div className="form-group mb-6">
                  <label className="form-label" htmlFor="matchTitle">매칭 제목</label>
                  <input 
                    type="text" 
                    id="matchTitle" 
                    className="form-input" 
                    placeholder="예: 20대 대학생 매칭" 
                    value={newMatchTitle}
                    onChange={(e) => setNewMatchTitle(e.target.value)}
                    required 
                    autoFocus
                  />
                </div>
                
                <div className="form-group mb-6">
                  <label className="form-label">매칭 주제 (최대 3개)</label>
                  <div className="flex gap-2 mb-2">
                    {[0, 1, 2].map(index => (
                      <input 
                        key={index}
                        type="text" 
                        className="form-input" 
                        placeholder={`주제 ${index + 1}`} 
                        value={newMatchThemes[index]}
                        onChange={(e) => {
                          const newThemes = [...newMatchThemes];
                          newThemes[index] = e.target.value;
                          setNewMatchThemes(newThemes);
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-secondary text-xs">입력된 주제를 기반으로 AI가 매칭 점수를 분석합니다.</p>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="form-group flex-1">
                    <label className="form-label">추출할 남성 인원</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" max="100"
                      value={maleCount}
                      onChange={(e) => setMaleCount(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">추출할 여성 인원</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" max="100"
                      value={femaleCount}
                      onChange={(e) => setFemaleCount(Number(e.target.value))}
                    />
                  </div>
                </div>

                
                <div className="flex justify-end gap-3">
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreateMatchModalOpen(false)}>
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isMatching}>
                    {isMatching ? 'AI 매칭 중...' : '생성 및 자동매칭'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Sub-Modal */}
      {detailMember && (
        <div className="modal-overlay" style={{ zIndex: 70 }} onClick={handleCloseDetailMember}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">회원 상세 정보</h3>
              <button className="close-button" onClick={handleCloseDetailMember}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="flex flex-col gap-4">
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-bold">{detailMember.name}</div>
                      {((detailMember.manager && detailMember.manager.name) || detailMember.managerName) && (
                        <span className="badge bg-gray-200 text-gray-700" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          담당: {(detailMember.manager && detailMember.manager.name) || detailMember.managerName}
                        </span>
                      )}
                    </div>
                    <button onClick={handleShowTraits} className="btn btn-sm" style={{ backgroundColor: '#6366f1', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>
                      🤖 AI성향분석
                    </button>
                  </div>
                  <div className="text-secondary">{detailMember.gender} • {detailMember.age}세</div>
                </div>
                
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div className="text-sm text-secondary mb-1">직업</div>
                    <div className="font-medium">{detailMember.job}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary mb-1">연소득</div>
                    <div className="font-medium">{((detailMember.salary || detailMember.income) ? `${detailMember.salary || detailMember.income} 만원` : '비공개')}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-secondary mb-1">취미</div>
                  <div className="font-medium">{detailMember.hobbies || detailMember.hobby || '정보 없음'}</div>
                </div>

                <div>
                  <div className="text-sm text-secondary mb-1">이상형</div>
                  <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                    {detailMember.idealType || '정보 없음'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-secondary mb-1">자기소개</div>
                  <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    {detailMember.introduction || detailMember.intro || '정보 없음'}
                  </div>
                </div>

                {showTraits && (
                  <div style={{ backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #c7d2fe' }}>
                    <h4 className="font-bold text-indigo-900 mb-2">🤖 AI 추출 성향 수치</h4>
                    {memberTraits && Object.keys(memberTraits).length > 0 ? (
                      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                        {Object.entries(memberTraits).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center text-sm" style={{ backgroundColor: Number(value) > 90 ? '#fee2e2' : Number(value) >= 80 ? '#fef9c3' : 'white', padding: '0.4rem', borderRadius: '4px', border: Number(value) > 90 ? '1px solid #fecaca' : Number(value) >= 80 ? '1px solid #fef08a' : '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                            <span className={Number(value) > 90 ? "text-red-800 font-medium" : Number(value) >= 80 ? "text-yellow-800 font-medium" : "text-gray-700"}>{key}</span>
                            <span className={`font-bold ${Number(value) > 90 ? "text-red-600" : Number(value) >= 80 ? "text-yellow-700" : "text-indigo-600"}`}>{value as number}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">추출된 성향 데이터가 없습니다.</div>
                    )}
                  </div>
                )}

                {showTraits && (
                  <div>
                    <div className="text-sm mb-1 font-semibold" style={{ color: '#1d4ed8' }}>AI 분석사항 (매칭 팁)</div>
                    <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#1e3a8a', border: '1px solid #bfdbfe' }}>
                      {detailMember.aiRemarks || detailMember.aiAnalysis || '분석 정보가 없습니다.'}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-secondary mb-1 text-red-500 font-semibold">주의사항</div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#991b1b', border: '1px solid #fecaca' }}>
                    {detailMember.remarks || detailMember.humanCaution || '입력된 주의사항이 없습니다.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 80 }} onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-red-600">매칭 삭제 확인</h3>
              <button className="close-button" onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body text-center py-6">
              <p className="text-lg mb-2">정말로 이 매칭을 삭제하시겠습니까?</p>
              <p className="text-sm text-secondary mb-8">이 작업은 되돌릴 수 없습니다.</p>
              
              <div className="flex justify-center gap-3">
                <button 
                  className="btn btn-outline" 
                  style={{ minWidth: '100px' }}
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  취소
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ minWidth: '100px', backgroundColor: '#ef4444', color: 'white' }}
                  onClick={handleDeleteMatch}
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
