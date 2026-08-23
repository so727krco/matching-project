import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Search, X, Heart, CheckCircle2, Lock, UserCog } from 'lucide-react';
import { getCouples, setCouples, type Member, type Couple, getApprovalRequests, getCurrentUser } from '../utils/storage';
import { usePopup } from '../contexts/PopupContext';

export default function MemberInquiry() {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembersList] = useState<Member[]>([]);
  const [couples, setCouplesList] = useState<Couple[]>([]);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [memberTraits, setMemberTraits] = useState<Record<string, number> | null>(null);
  const [showTraits, setShowTraits] = useState(false);
  const [approvals, setApprovals] = useState<any[]>([]); // To track approval status
  const { showAlert, showConfirm } = usePopup();

  const MOCK_MANAGERS = [
    { id: 'M001', name: '매니저A' },
    { id: 'M002', name: '매니저B' },
    { id: 'M003', name: '매니저C' },
    { id: 'M004', name: '매니저D' }
  ];

  // Couple registration mode states
  const [isCoupleMode, setIsCoupleMode] = useState(false);
  const [selectedForCouple, setSelectedForCouple] = useState<Member[]>([]);

  // Transfer Manager Mode states
  const [isTransferMode, setIsTransferMode] = useState(false);
  const [selectedForTransfer, setSelectedForTransfer] = useState<Member[]>([]);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState<any | null>(null);

  // Search Filters
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [myMembersOnly, setMyMembersOnly] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    gender: '전체',
    minAge: '',
    maxAge: '',
    minIncome: '',
    managerEmpNo: ''
  });

  const loadData = async () => {
    try {
      // Build query string from searchFilters
      const params = new URLSearchParams();
      if (searchFilters.name) params.append('name', searchFilters.name);
      if (searchFilters.gender && searchFilters.gender !== '전체') {
        params.append('gender', searchFilters.gender === '남성' ? 'M' : 'F');
      }
      if (searchFilters.minAge) params.append('minAge', searchFilters.minAge);
      if (searchFilters.maxAge) params.append('maxAge', searchFilters.maxAge);
      if (searchFilters.minIncome) params.append('minSalary', searchFilters.minIncome);
      if (searchFilters.managerEmpNo) params.append('managerEmpNo', searchFilters.managerEmpNo);

      const response = await fetch(`http://localhost:8080/api/members/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const allMembers = await response.json();

      const allCouples = getCouples();
      
      // Filter out members who are already in a couple (frontend side for now, or backend later)
      const availableMembers = allMembers.filter((m: any) => {
        return !allCouples.some(c => c.member1.id === m.id || c.member2.id === m.id);
      });
      
      setMembersList(availableMembers);
      setCouplesList(allCouples);
      setApprovals(getApprovalRequests());
      return availableMembers; // Return for useEffect
    } catch (error) {
      console.error(error);
      showAlert('회원 목록을 불러오는데 실패했습니다.');
      return [];
    }
  };

  useEffect(() => {
    loadData().then((loadedMembers) => {
      const state = location.state as { openDetailId?: number } | null;
      if (state?.openDetailId && loadedMembers) {
        const memberToOpen = loadedMembers.find((m: any) => m.id === state.openDetailId);
        if (memberToOpen) {
          setDetailMember(memberToOpen);
          // clear state
          window.history.replaceState({}, document.title);
        }
      }
    });
  }, [location.state]);

  
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

  const handleRequestInfoView = async (targetMember: Member) => {
    const managerId = localStorage.getItem('managerId');
    if (!managerId || !targetMember.manager?.id) return;

    try {
      const res = await fetch('http://localhost:8080/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'INFO_VIEW',
          requesterId: managerId,
          targetManagerId: targetMember.manager.id,
          targetMemberId: targetMember.id
        })
      });

      if (res.ok) {
        showAlert(`${targetMember.manager?.name} 담당자에게 열람 승인 요청을 보냈습니다.`);
      } else {
        showAlert('요청에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      showAlert('요청 중 오류가 발생했습니다.');
    }
  };

  const handleMemberClick = (member: Member) => {
    if (isCoupleMode) {
      if (selectedForCouple.find(m => m.id === member.id)) {
        // Deselect
        setSelectedForCouple(selectedForCouple.filter(m => m.id !== member.id));
      } else {
        // Select (max 2)
        if (selectedForCouple.length < 2) {
          setSelectedForCouple([...selectedForCouple, member]);
        } else {
          showAlert('커플은 2명까지만 선택 가능합니다.');
        }
      }
    } else if (isTransferMode) {
      if (selectedForTransfer.find(m => m.id === member.id)) {
        setSelectedForTransfer(selectedForTransfer.filter(m => m.id !== member.id));
      } else {
        setSelectedForTransfer([...selectedForTransfer, member]);
      }
    } else {
      setDetailMember(member);
    }
  };

  const handleTransferConfirm = async () => {
    if (!selectedManager || selectedForTransfer.length === 0) {
      showAlert('담당 매니저를 선택해주세요.');
      return;
    }
    
    const managerId = localStorage.getItem('managerId');
    if (!managerId) return;

    try {
      for (const member of selectedForTransfer) {
        await fetch('http://localhost:8080/api/approvals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'TRANSFER',
            requesterId: managerId,
            targetManagerId: selectedManager.id,
            targetMemberId: member.id
          })
        });
      }
      
      showAlert(selectedManager.name + ' 담당자에게 담당 변경 승인 요청을 보냈습니다.');
      setIsManagerModalOpen(false);
      setIsTransferMode(false);
      setSelectedForTransfer([]);
      setSelectedManager(null);
      setManagerSearchTerm('');
      loadData();
    } catch (e) {
      console.error(e);
      showAlert('담당 변경 요청 중 오류가 발생했습니다.');
    }
  };

  const handleRegisterCouple = () => {
    if (selectedForCouple.length !== 2) return;
    
    showConfirm(`${selectedForCouple[0].name}님과 ${selectedForCouple[1].name}님을 커플로 등록하시겠습니까?`, () => {
      const newCouple: Couple = {
        id: Date.now(),
        member1: selectedForCouple[0],
        member2: selectedForCouple[1],
        date: new Date().toISOString().split('T')[0]
      };

      const updatedCouples = [...couples, newCouple];
      setCouples(updatedCouples);
      setCouplesList(updatedCouples);
      
      // Update available members (remove the newly coupled members)
      setMembersList(prev => prev.filter(m => m.id !== selectedForCouple[0].id && m.id !== selectedForCouple[1].id));
      
      setSelectedForCouple([]);
      setIsCoupleMode(false);
      showAlert('커플 등록이 완료되었습니다!');
    });
  };

  const resetFilters = () => {
    setSearchFilters({
      name: '',
      gender: '전체',
      minAge: '',
      maxAge: '',
      minIncome: '',
      managerEmpNo: ''
    });
  };

  const handleSearch = () => {
    loadData();
  };

  // We can just use the server-fetched members directly. 
  // Client-side filtering is no longer needed since backend does it.
  const filteredMembers = myMembersOnly ? members.filter(m => m.manager?.id?.toString() === localStorage.getItem('managerId')) : members;

  return (
    <div className="app-container bg-gray-50 pb-20">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate('/main')}>
          <ChevronLeft size={20} />
          <span>메인으로</span>
        </button>
        <div className="app-title text-base">회원조회</div>
        <div style={{ width: '80px' }}></div>
      </header>
      
      <main className="main-content">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl mb-2">전체 회원 리스트</h2>
            <p className="text-secondary text-sm">현재 솔로인 회원 목록입니다.</p>
            <p className="text-primary text-sm font-medium mt-1">커플로 등록된 회원은 커플조회에서 확인하세요.</p>
          </div>
          <div className="flex gap-2">
            <button 
              className={`btn ${isTransferMode ? 'btn-danger' : 'btn-primary'}`}
              style={{ padding: '0.5rem 1rem', backgroundColor: isTransferMode ? '#6b7280' : '#2563eb', color: 'white', border: 'none' }}
              onClick={() => {
                if (isCoupleMode) {
                  setIsCoupleMode(false);
                  setSelectedForCouple([]);
                }
                setIsTransferMode(!isTransferMode);
                setSelectedForTransfer([]);
              }}
            >
              <UserCog size={16} />
              {isTransferMode ? '변경 취소' : '담당 변경'}
            </button>
            <button 
              className={`btn ${isCoupleMode ? 'btn-danger' : 'btn-primary'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => {
                if (isTransferMode) {
                  setIsTransferMode(false);
                  setSelectedForTransfer([]);
                }
                setIsCoupleMode(!isCoupleMode);
                setSelectedForCouple([]);
              }}
            >
              <Heart size={16} />
              {isCoupleMode ? '등록 취소' : '커플 등록'}
            </button>
          </div>
        </div>

        {/* Search Toggle Button */}
        <div className="mb-4 flex gap-2">
          <button 
            className="btn btn-outline flex-1"
            style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', backgroundColor: isSearchOpen ? 'var(--color-surface-hover)' : 'white' }}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search size={16} />
            상세검색 {isSearchOpen ? '닫기' : '열기'}
          </button>
          <button 
            className="btn btn-primary"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 1.5rem', whiteSpace: 'nowrap' }}
            onClick={handleSearch}
          >
            재조회
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>
            <input 
              type="checkbox" 
              checked={myMembersOnly} 
              onChange={(e) => setMyMembersOnly(e.target.checked)} 
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            내 담당회원만 보기
          </label>
        </div>

        {/* Search Form Panel */}
        {isSearchOpen && (
          <div className="card mb-6" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label text-xs">이름</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="이름 검색" 
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters({...searchFilters, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label text-xs">성별</label>
                <select 
                  className="form-input"
                  value={searchFilters.gender}
                  onChange={(e) => setSearchFilters({...searchFilters, gender: e.target.value})}
                >
                  <option value="전체">전체</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label text-xs">나이 범위 (세)</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="최소" 
                    value={searchFilters.minAge}
                    onChange={(e) => setSearchFilters({...searchFilters, minAge: e.target.value})}
                  />
                  <span>~</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="최대" 
                    value={searchFilters.maxAge}
                    onChange={(e) => setSearchFilters({...searchFilters, maxAge: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label text-xs">최소 연소득 (만원)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="예: 5000" 
                  value={searchFilters.minIncome}
                  onChange={(e) => setSearchFilters({...searchFilters, minIncome: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label text-xs">담당 매니저 (사번)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: M001" 
                  value={searchFilters.managerEmpNo}
                  onChange={(e) => setSearchFilters({...searchFilters, managerEmpNo: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-outline" style={{ padding: '0.4rem 1rem' }} onClick={resetFilters}>초기화</button>
              <button className="btn btn-primary" style={{ padding: '0.4rem 1rem' }} onClick={handleSearch}>검색</button>
            </div>
          </div>
        )}

        {isCoupleMode && (
          <div className="mb-4 p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', color: '#831843' }}>
            <div className="text-sm">
              커플로 맺어줄 <strong>두 명의 회원</strong>을 선택해주세요. <br/>
              현재 선택: <strong>{selectedForCouple.length}명</strong>
            </div>
            <button 
              className="btn"
              style={{ 
                backgroundColor: selectedForCouple.length === 2 ? '#be185d' : '#f9a8d4', 
                color: '#fff',
                padding: '0.5rem 1rem',
                cursor: selectedForCouple.length === 2 ? 'pointer' : 'not-allowed'
              }}
              disabled={selectedForCouple.length !== 2}
              onClick={handleRegisterCouple}
            >
              커플 맺어주기
            </button>
          </div>
        )}

        {isTransferMode && (
          <div className="mb-4 p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412' }}>
            <div className="text-sm">
              담당자를 변경할 <strong>회원</strong>을 선택해주세요. <br/>
              현재 선택: <strong>{selectedForTransfer.length}명</strong>
            </div>
            <button 
              className="btn"
              style={{ 
                backgroundColor: selectedForTransfer.length > 0 ? '#f97316' : '#fdba74', 
                color: '#fff',
                padding: '0.5rem 1rem',
                cursor: selectedForTransfer.length > 0 ? 'pointer' : 'not-allowed',
                border: 'none'
              }}
              disabled={selectedForTransfer.length === 0}
              onClick={() => setIsManagerModalOpen(true)}
            >
              담당 변경
            </button>
          </div>
        )}

        <div className="list-container">
          {filteredMembers.length === 0 ? (
            <div className="text-center text-secondary py-12">표시할 회원이 없습니다.</div>
          ) : (
            filteredMembers.map((member) => {
              const isSelectedForCouple = selectedForCouple.some(m => m.id === member.id);
              const isSelectedForTransfer = selectedForTransfer.some(m => m.id === member.id);
              const isSelected = isSelectedForCouple || isSelectedForTransfer;
              
              return (
                <div 
                  key={member.id} 
                  className={`list-item card ${isSelected ? 'border-primary' : ''}`}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)'
                  }}
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="flex items-center gap-4">
                    <div style={{ backgroundColor: isSelected ? 'var(--color-primary)' : 'hsl(210, 80%, 95%)', padding: '0.75rem', borderRadius: '50%', color: isSelected ? '#fff' : 'var(--color-info)' }}>
                      {isCoupleMode ? (
                        isSelectedForCouple ? <CheckCircle2 size={20} /> : <Heart size={20} />
                      ) : isTransferMode ? (
                        isSelectedForTransfer ? <CheckCircle2 size={20} /> : <UserCog size={20} />
                      ) : (
                        <Search size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{member.name} <span className="text-sm font-normal text-secondary">({member.gender}, {member.age}세)</span></div>
                      <div className="text-sm text-secondary mt-1">{member.job}</div>
                    </div>
                  </div>
                  {member.manager?.name && (
                    <div className="badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      {member.manager.name} 담당
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Member Detail Modal */}
      {detailMember && (
        <div className="modal-overlay" style={{ zIndex: 70 }} onClick={() => handleCloseDetailMember()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">회원 상세 정보</h3>
              <button className="close-button" onClick={() => handleCloseDetailMember()}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="flex flex-col gap-4">
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>

                  <div className="flex justify-end mb-2 gap-2">
                    {(detailMember.manager?.id?.toString() === localStorage.getItem('managerId') || localStorage.getItem('managerRole') === 'ADMIN') && (
                      <button onClick={() => navigate(`/members/edit/${detailMember.id}`)} className="btn btn-sm" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>
                        ✏️ 회원정보 수정
                      </button>
                    )}
                    <button onClick={handleShowTraits} className="btn btn-sm" style={{ backgroundColor: '#6366f1', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>
                      ✨ AI성향분석
                    </button>
                  </div>
                  
                  {showTraits && (
                    <div style={{ backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #c7d2fe' }}>
                      <h4 className="font-bold text-indigo-900 mb-2">🧠 AI 추출 성향 수치</h4>
                      {memberTraits && Object.keys(memberTraits).length > 0 ? (
                        <>
                          <div className="grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                            {Object.entries(memberTraits).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center text-sm" style={{ backgroundColor: Number(value) > 90 ? '#fee2e2' : Number(value) === 90 ? '#fef9c3' : 'white', padding: '0.4rem', borderRadius: '4px', border: Number(value) > 90 ? '1px solid #fecaca' : Number(value) === 90 ? '1px solid #fef08a' : '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                                <span className={Number(value) > 90 ? "text-red-800 font-medium" : Number(value) === 90 ? "text-yellow-800 font-medium" : "text-gray-700"}>{key}</span>
                                <span className={`font-bold ${Number(value) > 90 ? "text-red-600" : Number(value) === 90 ? "text-yellow-700" : "text-indigo-600"}`}>{value}</span>
                              </div>
                            ))}
                          </div>
                          {detailMember.aiRemarks && (
                            <div className="mt-2 p-3 bg-white rounded border border-indigo-100 text-sm text-gray-800">
                              <h5 className="font-bold text-indigo-800 mb-1">📝 AI 종합 분석 의견</h5>
                              <div style={{ whiteSpace: 'pre-wrap' }}>{detailMember.aiRemarks}</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">추출된 성향 데이터가 없습니다.</div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xl font-bold">{detailMember.name}</div>
                    {detailMember.manager?.name && (
                      <span className="badge bg-gray-200 text-gray-700" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        담당: {detailMember.manager?.name}
                      </span>
                    )}
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
                    <div className="font-medium">{detailMember.salary ? `${detailMember.salary} 만원` : '비공개'}</div>
                  </div>
                </div>

                {/* 민감 정보 (담당 매니저만 열람 가능) */}
                <div style={{ border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f9fafb' }}>
                    <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded">
                      <Lock size={16} className={detailMember.manager?.id?.toString() === localStorage.getItem('managerId') ? 'text-green-600' : 'text-red-500'} />
                      <h4 className="font-semibold text-sm">연락처 및 사진 (담당 매니저 전용)</h4>
                    </div>
                    
                    {(() => {
                      const hasAccess = detailMember.manager?.id?.toString() === localStorage.getItem('managerId');
                    const req = approvals.find(r => r.type === 'INFO_VIEW' && r.targetMemberId === detailMember.id && r.requesterName === getCurrentUser());
                    const isApproved = req?.status === 'approved';
                    const isPending = req?.status === 'pending';

                    if (hasAccess || isApproved) {
                      return (
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-secondary mr-2">연락처:</span>
                              <span className="font-medium">{detailMember.phoneNumber || '정보 없음'}</span>
                            </div>
                            <div>
                              <span className="text-secondary mr-2">카톡ID:</span>
                              <span className="font-medium">{detailMember.kakaoId || '정보 없음'}</span>
                            </div>
                          </div>
                          
                          {/* 썸네일 목업 */}
                          <div>
                            <div className="text-xs text-secondary mb-2">등록된 사진</div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {detailMember.photos && detailMember.photos.length > 0 ? (
                                detailMember.photos.map((url, idx) => (
                                  <img key={idx} src={url} alt="Profile" className="h-20 w-20 rounded border object-cover" />
                                ))
                              ) : (
                                <div className="h-20 w-20 bg-gray-200 rounded border flex items-center justify-center text-gray-400 text-xs">사진없음</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="text-center py-4 text-sm text-secondary flex flex-col items-center gap-2">
                        <Lock size={24} className="text-gray-300" />
                        <span>{detailMember.manager?.name} 매니저만 열람할 수 있는 민감 정보입니다.</span>
                        <button 
                          className="mt-2 btn btn-outline disabled:opacity-50" 
                          style={{ borderColor: isPending ? '#9ca3af' : 'var(--color-primary)', color: isPending ? '#9ca3af' : 'var(--color-primary)', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                          onClick={() => handleRequestInfoView(detailMember)}
                          disabled={isPending}
                        >
                          {isPending ? '승인 대기 중...' : '담당자에게 열람 승인 요청'}
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <div className="text-sm text-secondary mb-1">취미</div>
                  <div className="font-medium">{detailMember.hobbies || '정보 없음'}</div>
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
                    {detailMember.introduction || '정보 없음'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-secondary mb-1 text-red-500 font-semibold">주의사항</div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#991b1b', border: '1px solid #fecaca' }}>
                    {detailMember.remarks || '입력된 주의사항이 없습니다.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manager Transfer Modal */}
      {isManagerModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 80 }} onClick={() => setIsManagerModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">담당자 선택</h3>
              <button className="close-button" onClick={() => setIsManagerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-4">
                <div className="form-group mb-0">
                  <div className="relative" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', backgroundColor: 'white' }}>
                    <Search size={18} className="text-secondary mr-2" />
                    <input 
                      type="text" 
                      placeholder="매니저 이름 또는 ID 검색" 
                      style={{ border: 'none', outline: 'none', width: '100%' }}
                      value={managerSearchTerm}
                      onChange={(e) => setManagerSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="list-container" style={{ maxHeight: '300px', overflowY: 'auto', gap: '0.5rem' }}>
                {MOCK_MANAGERS.filter(m => m.name.includes(managerSearchTerm) || m.id.includes(managerSearchTerm)).length === 0 && (
                  <div className="text-center text-secondary py-4 text-sm">검색 결과가 없습니다.</div>
                )}
                {MOCK_MANAGERS.filter(m => m.name.includes(managerSearchTerm) || m.id.includes(managerSearchTerm)).map(manager => (
                  <div 
                    key={manager.id} 
                    className="card list-item"
                    style={{ 
                      padding: '1rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      border: selectedManager?.id === manager.id ? '2px solid #f97316' : '1px solid var(--color-border)',
                      backgroundColor: selectedManager?.id === manager.id ? '#fff7ed' : 'white'
                    }}
                    onClick={() => setSelectedManager(manager)}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">{manager.name}</div>
                      <div className="text-sm text-secondary">ID: {manager.id}</div>
                    </div>
                    {selectedManager?.id === manager.id && (
                      <CheckCircle2 size={20} color="#f97316" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button className="btn btn-outline" onClick={() => setIsManagerModalOpen(false)}>
                  취소
                </button>
                <button 
                  className="btn" 
                  style={{ backgroundColor: '#f97316', color: 'white', border: 'none', padding: '0.5rem 1rem' }}
                  onClick={handleTransferConfirm}
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

