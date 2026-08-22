import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Calendar, User, Search } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

interface MatchingHistory {
  id: number;
  managerName: string;
  searchTopics: string;
  extractedTargets: Record<string, number>;
  status?: string;
  createdAt: string;
}

export default function MatchingHistoryScreen() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();
  const [historyList, setHistoryList] = useState<MatchingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/matching/history');
        if (!response.ok) throw new Error('Failed to fetch matching history');
        const data = await response.json();
        setHistoryList(data);
      } catch (err) {
        console.error(err);
        showAlert('매칭 이력을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [showAlert]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const parseTopics = (topicsStr: string) => {
    try {
      return JSON.parse(topicsStr).join(', ');
    } catch {
      return topicsStr;
    }
  };

  return (
    <div className="app-container bg-gray-50">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate('/admin')}>
          <ChevronLeft size={20} />
          <span>관리자 홈</span>
        </button>
        <div className="app-title text-base">매칭 이력(로그)</div>
        <div style={{ width: '80px' }}></div>
      </header>
      
      <main className="main-content">
        <div className="mb-6 flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          <h2 className="text-2xl font-bold">매칭 시도 로그</h2>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10 text-secondary">로딩 중...</div>
        ) : historyList.length === 0 ? (
          <div className="text-center py-10 text-secondary card">아직 매칭 이력이 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {historyList.map(item => (
              <div key={item.id} className="card p-4">
                <div className="flex justify-between items-start mb-3 border-b pb-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-semibold text-gray-800">{item.managerName}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-1">매니저</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={14} />
                    {formatDate(item.createdAt)}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Search size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-gray-700">입력된 조회 주제</span>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-md text-sm text-gray-800">
                    {parseTopics(item.searchTopics)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">AI 변환 기준 자료(가중치)</span>
                  </div>
                  <div className="bg-green-50 border border-green-100 p-2 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.extractedTargets).map(([key, value]) => (
                        <span key={key} className="text-xs bg-white border border-green-200 px-2 py-1 rounded-md shadow-sm">
                          <span className="text-gray-600">{key}:</span> <span className="font-bold text-green-700">{value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
