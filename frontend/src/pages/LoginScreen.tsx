import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      showAlert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/managers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || '로그인에 실패했습니다.');
      }

      const managerData = await response.json();
      
      // 로그인 정보를 localStorage에 임시 저장 (현재 프론트엔드 상태 관리를 위해)
      localStorage.setItem('managerId', managerData.id);
      localStorage.setItem('managerName', managerData.name);
      if (managerData.isAdmin) {
        localStorage.setItem('managerRole', 'ADMIN');
      }

      // 메인 화면으로 이동
      navigate('/main');
    } catch (error: any) {
      showAlert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <button className="back-button mb-6" onClick={() => navigate('/')} type="button">
          <ChevronLeft size={16} />
          돌아가기
        </button>
        
        <h2 className="text-2xl mb-2 text-center">로그인</h2>
        <p className="text-secondary text-sm text-center mb-8">담당자 계정에 로그인하세요.</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="username">아이디</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input" 
              placeholder="아이디를 입력하세요"
            />
          </div>
          
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="password">비밀번호</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input" 
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '확인'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-full"
              onClick={() => navigate('/signup')}
              disabled={isLoading}
            >
              회원가입하기
            </button>
            <div className="text-center mt-2">
              <button 
                type="button" 
                className="text-sm text-primary underline"
                onClick={() => navigate('/reset-password')}
                disabled={isLoading}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                비밀번호를 잃어버리셨나요?
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
