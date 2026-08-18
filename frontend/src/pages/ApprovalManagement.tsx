import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, UserSearch, UserCog, Clock } from 'lucide-react';

export interface ApprovalRequestDto {
  id: number;
  type: 'INFO_VIEW' | 'TRANSFER';
  requesterId: number;
  requesterName: string;
  targetManagerId: number;
  targetManagerName: string;
  targetMemberId: number;
  targetMemberName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}

export default function ApprovalManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'INFO_VIEW' | 'TRANSFER'>('INFO_VIEW');
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  
  // Custom Modal States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reqToCancel, setReqToCancel] = useState<number | null>(null);

  const managerId = localStorage.getItem('managerId');
  const API_BASE = 'http://localhost:8080/api/approvals';

  const fetchApprovals = async () => {
    if (!managerId) return;
    try {
      const res = await fetch(`${API_BASE}?managerId=${managerId}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (reqId: number) => {
    try {
      const res = await fetch(`${API_BASE}/${reqId}/approve`, { method: 'POST' });
      if (res.ok) fetchApprovals();
    } catch (e) { console.error(e); }
  };

  const handleReject = async (reqId: number) => {
    try {
      const res = await fetch(`${API_BASE}/${reqId}/reject`, { method: 'POST' });
      if (res.ok) fetchApprovals();
    } catch (e) { console.error(e); }
  };

  const handleCancel = (reqId: number) => {
    setReqToCancel(reqId);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!reqToCancel) return;
    try {
      const res = await fetch(`${API_BASE}/${reqToCancel}/cancel`, { method: 'POST' });
      if (res.ok) fetchApprovals();
    } catch (e) { console.error(e); }
    
    setCancelModalOpen(false);
    setReqToCancel(null);
  };

  const filteredRequests = requests.filter(req => req.type === activeTab && req.status === 'PENDING');
  const historyRequests = requests.filter(req => req.type === activeTab && req.status !== 'PENDING');

  const infoViewPendingCount = requests.filter(req => req.type === 'INFO_VIEW' && req.status === 'PENDING').length;
  const transferPendingCount = requests.filter(req => req.type === 'TRANSFER' && req.status === 'PENDING').length;

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'INFO_VIEW': return '정보 열람';
      case 'TRANSFER': return '담당 변경';
      default: return '기타';
    }
  };

  const getTypeIcon = (type: string, size = 20) => {
    switch(type) {
      case 'INFO_VIEW': return <UserSearch size={size} />;
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
              backgroundColor: activeTab === 'INFO_VIEW' ? '#f0fdfa' : undefined,
              borderColor: activeTab === 'INFO_VIEW' ? '#2dd4bf' : undefined,
              boxShadow: activeTab === 'INFO_VIEW' ? '0 0 0 2px #2dd4bf' : undefined
            }}
            onClick={() => setActiveTab('INFO_VIEW')}
          >
            <div className="p-1 rounded-full mb-1" style={{ backgroundColor: activeTab === 'INFO_VIEW' ? '#14b8a6' : '#e5e7eb', color: activeTab === 'INFO_VIEW' ? '#ffffff' : '#6b7280' }}>
              <UserSearch size={18} />
            </div>
            <div style={{ color: activeTab === 'INFO_VIEW' ? '#0f766e' : '#6b7280', fontSize: '12px', fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
              정보 열람
            </div>
            {infoViewPendingCount > 0 && (
              <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '9999px', backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                {infoViewPendingCount}
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
          <Clock size={18} className="text-primary" /> 대기중인 요청 ({filteredRequests.length})
        </h3>
        
        <div className="flex flex-col gap-3 mb-8">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-secondary bg-white rounded-lg border border-dashed">대기중인 승인 요청이 없습니다.</div>
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
                        대상: {req.targetMemberName} 회원
                      </div>
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
                    <div className="text-sm">{req.requesterName} → {req.targetMemberName}</div>
                  </div>
                  <div className="text-xs text-secondary">{req.requestDate}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-sm font-semibold ${req.status === 'APPROVED' ? 'text-green-600' : 'text-red-500'}`}>
                    {req.status === 'APPROVED' ? '승인됨' : '반려됨'}
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
                    <X size={16} /> 네, 취소합니다
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
