import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, UserSearch, UserPlus, Clock, UserCog } from 'lucide-react';
import { getApprovalRequests, setApprovalRequests, type ApprovalRequest, getMembers, setMembers as setStorageMembers, getMatches, setMatches as setStorageMatches, type Member, type Match } from '../utils/storage';

const CURRENT_MANAGER = '매니저A';

export default function ApprovalManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'INFO_VIEW' | 'MATCH_INVITE' | 'TRANSFER'>('INFO_VIEW');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  // Custom Modal States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reqToCancel, setReqToCancel] = useState<number | null>(null);

  useEffect(() => {
    setRequests(getApprovalRequests().filter(req => req.targetManagerName === CURRENT_MANAGER));
    setMembers(getMembers());
    setMatches(getMatches());
  }, []);

  const handleApprove = (reqId: number) => {
    const allReqs = getApprovalRequests();
    const updated = allReqs.map(r => r.id === reqId ? { ...r, status: 'approved' as const } : r);
    setApprovalRequests(updated);
    setRequests(updated.filter(req => req.targetManagerName === CURRENT_MANAGER));
    
    const req = allReqs.find(r => r.id === reqId);
    if (!req) return;

    if (req.type === 'MATCH_INVITE' && req.matchId) {
      const allMatches = getMatches();
      const matchIndex = allMatches.findIndex(m => m.id === req.matchId);
      if (matchIndex > -1) {
        const match = allMatches[matchIndex];
        const memIndex = match.members.findIndex(m => m.id === req.targetMemberId);
        if (memIndex > -1) {
          match.members[memIndex].approvalStatus = 'approved';
          setStorageMatches([...allMatches]);
          setMatches([...allMatches]);
        }
      }
    } else if (req.type === 'TRANSFER') {
      // Update managerName in Members
      const allMembers = getMembers();
      const memIndex = allMembers.findIndex(m => m.id === req.targetMemberId);
      if (memIndex > -1) {
        allMembers[memIndex].managerName = req.targetManagerName;
        setStorageMembers([...allMembers]);
        setMembers([...allMembers]);
      }
    }
  };

  const handleReject = (reqId: number) => {
    const allReqs = getApprovalRequests();
    const updated = allReqs.map(r => r.id === reqId ? { ...r, status: 'rejected' as const } : r);
    setApprovalRequests(updated);
    setRequests(updated.filter(req => req.targetManagerName === CURRENT_MANAGER));
  };

  const handleCancel = (reqId: number) => {
    setReqToCancel(reqId);
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (!reqToCancel) return;
    
    const allReqs = getApprovalRequests();
    const updated = allReqs.map(r => r.id === reqToCancel ? { ...r, status: 'pending' as const } : r);
    setApprovalRequests(updated);
    setRequests(updated.filter(req => req.targetManagerName === CURRENT_MANAGER));

    const req = allReqs.find(r => r.id === reqToCancel);
    if (req?.type === 'MATCH_INVITE' && req.matchId) {
      const allMatches = getMatches();
      const matchIndex = allMatches.findIndex(m => m.id === req.matchId);
      if (matchIndex > -1) {
        const match = allMatches[matchIndex];
        const memIndex = match.members.findIndex(m => m.id === req.targetMemberId);
        if (memIndex > -1) {
          match.members[memIndex].approvalStatus = 'pending';
          setStorageMatches([...allMatches]);
          setMatches([...allMatches]);
        }
      }
    } else if (req?.type === 'TRANSFER') {
      const allMembers = getMembers();
      const memIndex = allMembers.findIndex(m => m.id === req.targetMemberId);
      if (memIndex > -1) {
        // Rollback to requester
        allMembers[memIndex].managerName = req.requesterName;
        setStorageMembers([...allMembers]);
        setMembers([...allMembers]);
      }
    }
    
    setCancelModalOpen(false);
    setReqToCancel(null);
  };

  const filteredRequests = requests.filter(req => req.type === activeTab && req.status === 'pending');
  const historyRequests = requests.filter(req => req.type === activeTab && req.status !== 'pending');

  const infoViewPendingCount = requests.filter(req => req.type === 'INFO_VIEW' && req.status === 'pending').length;
  const matchInvitePendingCount = requests.filter(req => req.type === 'MATCH_INVITE' && req.status === 'pending').length;
  const transferPendingCount = requests.filter(req => req.type === 'TRANSFER' && req.status === 'pending').length;

  const getMemberName = (id: number) => members.find(m => m.id === id)?.name || '알 수 없음';
  const getMatchTitle = (id?: number) => matches.find(m => m.id === id)?.title || '알 수 없는 매칭';

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'INFO_VIEW': return '정보 열람';
      case 'MATCH_INVITE': return '매칭 초대';
      case 'TRANSFER': return '담당 변경';
      default: return '기타';
    }
  };

  const getTypeIcon = (type: string, size = 20) => {
    switch(type) {
      case 'INFO_VIEW': return <UserSearch size={size} />;
      case 'MATCH_INVITE': return <UserPlus size={size} />;
      case 'TRANSFER': return <UserCog size={size} />;
      default: return <Check size={size} />;
    }
  };

  return (
    <div className="app-container bg-gray-50">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate('/main')}>
          <ChevronLeft size={20} />
          <span>메인으로</span>
        </button>
        <div className="app-title text-base">승인 관리</div>
        <div style={{ width: '80px' }}></div>
      </header>

      <div className="bg-white border-b sticky top-14 z-10 px-4 pt-10 pb-3">
        <div className="flex gap-2" style={{ marginTop: '10pt' }}>
          {/* INFO_VIEW Tab */}
          <button 
            className={`flex-1 card border transition-all ${activeTab === 'INFO_VIEW' ? 'shadow-md' : 'bg-gray-50 hover:bg-white text-gray-500'}`}
            style={{ 
              padding: '8px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backgroundColor: activeTab === 'INFO_VIEW' ? '#f0f9ff' : undefined,
              borderColor: activeTab === 'INFO_VIEW' ? '#38bdf8' : undefined,
              boxShadow: activeTab === 'INFO_VIEW' ? '0 0 0 2px #38bdf8' : undefined
            }}
            onClick={() => setActiveTab('INFO_VIEW')}
          >
            <div className="p-1 rounded-full mb-1" style={{ backgroundColor: activeTab === 'INFO_VIEW' ? '#0ea5e9' : '#e5e7eb', color: activeTab === 'INFO_VIEW' ? '#ffffff' : '#6b7280' }}>
              <UserSearch size={18} />
            </div>
            <div style={{ color: activeTab === 'INFO_VIEW' ? '#0284c7' : '#6b7280', fontSize: '12px', fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
              정보 열람 
            </div>
            {infoViewPendingCount > 0 && (
              <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '9999px', backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                {infoViewPendingCount}
              </div>
            )}
          </button>
          
          {/* MATCH_INVITE Tab */}
          <button 
            className={`flex-1 card border transition-all ${activeTab === 'MATCH_INVITE' ? 'shadow-md' : 'bg-gray-50 hover:bg-white text-gray-500'}`}
            style={{ 
              padding: '8px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backgroundColor: activeTab === 'MATCH_INVITE' ? '#f0f9ff' : undefined,
              borderColor: activeTab === 'MATCH_INVITE' ? '#38bdf8' : undefined,
              boxShadow: activeTab === 'MATCH_INVITE' ? '0 0 0 2px #38bdf8' : undefined
            }}
            onClick={() => setActiveTab('MATCH_INVITE')}
          >
            <div className="p-1 rounded-full mb-1" style={{ backgroundColor: activeTab === 'MATCH_INVITE' ? '#0ea5e9' : '#e5e7eb', color: activeTab === 'MATCH_INVITE' ? '#ffffff' : '#6b7280' }}>
              <UserPlus size={18} />
            </div>
            <div style={{ color: activeTab === 'MATCH_INVITE' ? '#0284c7' : '#6b7280', fontSize: '12px', fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
              매칭 초대 
            </div>
            {matchInvitePendingCount > 0 && (
              <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '9999px', backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                {matchInvitePendingCount}
              </div>
            )}
          </button>

          {/* TRANSFER Tab */}
          <button 
            className={`flex-1 card border transition-all ${activeTab === 'TRANSFER' ? 'shadow-md' : 'bg-gray-50 hover:bg-white text-gray-500'}`}
            style={{ 
              padding: '8px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backgroundColor: activeTab === 'TRANSFER' ? '#f0f9ff' : undefined,
              borderColor: activeTab === 'TRANSFER' ? '#38bdf8' : undefined,
              boxShadow: activeTab === 'TRANSFER' ? '0 0 0 2px #38bdf8' : undefined
            }}
            onClick={() => setActiveTab('TRANSFER')}
          >
            <div className="p-1 rounded-full mb-1" style={{ backgroundColor: activeTab === 'TRANSFER' ? '#0ea5e9' : '#e5e7eb', color: activeTab === 'TRANSFER' ? '#ffffff' : '#6b7280' }}>
              <UserCog size={18} />
            </div>
            <div style={{ color: activeTab === 'TRANSFER' ? '#0284c7' : '#6b7280', fontSize: '12px', fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
              담당 변경 
            </div>
            {transferPendingCount > 0 && (
              <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '9999px', backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                {transferPendingCount}
              </div>
            )}
          </button>
        </div>
      </div>
      
      <main className="main-content" style={{ padding: '1rem' }}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock size={18} className="text-primary" /> 대기 중인 요청 ({filteredRequests.length})
        </h3>
        
        <div className="flex flex-col gap-3 mb-8">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-secondary bg-white rounded-lg border border-dashed">대기 중인 승인 요청이 없습니다.</div>
          ) : (
            filteredRequests.map(req => (
              <div key={req.id} className="card p-4 border flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                      {getTypeIcon(req.type, 20)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {getTypeLabel(req.type)}
                        </span>
                        <div className="text-sm text-secondary">
                          <span className="font-semibold text-gray-900">{req.requesterName}</span> 님이 요청했습니다.
                        </div>
                      </div>
                      <div className="font-medium">
                        대상: {getMemberName(req.targetMemberId)} 회원
                      </div>
                      {req.type === 'MATCH_INVITE' && (
                        <div className="text-sm mt-1 text-gray-600">
                          초대 매칭: {getMatchTitle(req.matchId)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 btn btn-primary py-2 text-sm flex justify-center items-center gap-1" onClick={() => handleApprove(req.id)}>
                    <Check size={16} /> 승인
                  </button>
                  <button className="flex-1 btn btn-outline py-2 text-sm flex justify-center items-center gap-1" style={{ borderColor: '#fca5a5', color: '#dc2626' }} onClick={() => handleReject(req.id)}>
                    <X size={16} /> 반려
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <h3 className="font-bold text-lg mb-4 text-gray-500">처리 내역 ({historyRequests.length})</h3>
        <div className="flex flex-col gap-3">
          {historyRequests.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400">처리 내역이 없습니다.</div>
          ) : (
            historyRequests.map(req => (
              <div key={req.id} className="p-4 bg-white rounded-lg border opacity-70 flex justify-between items-center group transition-opacity hover:opacity-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {getTypeLabel(req.type)}
                    </span>
                    <div className="text-sm">{req.requesterName} → {getMemberName(req.targetMemberId)}</div>
                  </div>
                  <div className="text-xs text-secondary">{req.requestDate}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-sm font-semibold ${req.status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                    {req.status === 'approved' ? '승인됨' : '반려됨'}
                  </div>
                  <button 
                    className="text-xs px-3 py-1.5 border rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => handleCancel(req.id)}
                  >
                    취소
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {cancelModalOpen && (
        <div className="modal-overlay z-50">
          {(() => {
            const req = requests.find(r => r.id === reqToCancel) || historyRequests.find(r => r.id === reqToCancel);
            if (!req) return null;
            return (
              <div className="card p-4 border flex flex-col gap-3" style={{ backgroundColor: 'white', maxWidth: '400px', width: '90%' }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                      {getTypeIcon(req.type, 20)}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {getTypeLabel(req.type)}
                        </span>
                        <div className="text-sm text-secondary">
                          <span className="font-semibold text-gray-900">{req.requesterName}</span> 님의 요청
                        </div>
                      </div>
                      <div className="font-medium text-gray-900 mt-1">
                        이 요청의 승인(또는 반려)을 취소하시겠습니까?
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 btn btn-primary py-2 text-sm flex justify-center items-center gap-1" onClick={() => setCancelModalOpen(false)}>
                    <Check size={16} /> 아니오
                  </button>
                  <button className="flex-1 btn btn-outline py-2 text-sm flex justify-center items-center gap-1" style={{ borderColor: '#fca5a5', color: '#dc2626' }} onClick={confirmCancel}>
                    <X size={16} /> 예, 취소합니다
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
