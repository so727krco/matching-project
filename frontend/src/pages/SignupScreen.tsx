import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

export default function SignupScreen() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    empNo: '',
    name: '',
    birthDate: '',
    introduction: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // 1. 빈 값 체크
    if (!formData.username || !formData.password || !formData.empNo || !formData.name || !formData.birthDate || !formData.introduction) {
      showAlert('모든 필드를 입력해주세요.');
      return false;
    }
    
    // 2. 사번 8자리 체크
    if (formData.empNo.length !== 8) {
      showAlert('사번은 8자리여야 합니다.');
      return false;
    }

    // 3. 비밀번호 6자 이하 불가 (즉, 7자 이상)
    if (formData.password.length <= 6) {
      showAlert('비밀번호는 7자 이상이어야 합니다.');
      return false;
    }

    // 4. 생년월일 달력 유효성 체크 (예: 2월 30일 등 존재하지 않는 날짜 방지)
    const date = new Date(formData.birthDate);
    const isValidDate = !isNaN(date.getTime()) && date.toISOString().startsWith(formData.birthDate);
    if (!isValidDate) {
      showAlert('유효하지 않은 생년월일입니다. 달력에 있는 날짜를 선택해주세요.');
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/managers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || '회원가입에 실패했습니다.');
      }

      showAlert('회원가입이 완료되었습니다. 로그인 해주세요.', () => {
        navigate('/login');
      });
    } catch (error: any) {
      showAlert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-screen" style={{ padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="back-button mb-6" onClick={() => navigate(-1)} type="button">
          <ChevronLeft size={16} />
          돌아가기
        </button>
        
        <h2 className="text-2xl mb-2 text-center">회원가입</h2>
        <p className="text-secondary text-sm text-center mb-6">담당자 계정을 생성하세요.</p>
        
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
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

          <div className="form-group">
            <label className="form-label" htmlFor="password">비밀번호</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input" 
              placeholder="7자 이상 입력하세요"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="empNo">사번</label>
            <input 
              type="text" 
              id="empNo" 
              name="empNo"
              value={formData.empNo}
              onChange={handleChange}
              className="form-input" 
              placeholder="정확히 8자리를 입력하세요"
              maxLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">이름</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input" 
              placeholder="본명을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="birthDate">생년월일</label>
            <input 
              type="date" 
              id="birthDate" 
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="form-input" 
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label" htmlFor="introduction">자기소개</label>
            <textarea 
              id="introduction" 
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              className="form-input" 
              placeholder="간단한 자기소개를 입력하세요"
              rows={3}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
            {isLoading ? '처리 중...' : '가입하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
