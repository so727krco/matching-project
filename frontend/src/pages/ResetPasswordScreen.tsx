import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();

  const [formData, setFormData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 만약 아이디를 다시 수정하려고 하면 인증 상태 초기화
    if (name === 'username') {
      setIsUsernameVerified(false);
    }
  };

  const handleVerifyUsername = async () => {
    if (!formData.username) {
      showAlert('아이디를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/managers/check-username?username=${formData.username}`);
      if (!response.ok) {
        throw new Error('아이디 확인 중 오류가 발생했습니다.');
      }
      
      const exists = await response.json();
      if (exists) {
        setIsUsernameVerified(true);
      } else {
        showAlert('해당 아이디로 조회되는 정보가 없습니다.');
        setIsUsernameVerified(false);
      }
    } catch (error: any) {
      showAlert(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.newPassword || !formData.confirmPassword) {
      showAlert('모든 항목을 입력해주세요.');
      return;
    }

    if (!isUsernameVerified) {
      showAlert('먼저 아이디 확인을 진행해주세요.');
      return;
    }

    if (formData.newPassword.length <= 6) {
      showAlert('새 비밀번호는 7자 이상이어야 합니다.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showAlert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/managers/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          newPassword: formData.newPassword
        }),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || '비밀번호 변경에 실패했습니다.');
      }

      showAlert('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.');
      navigate('/login');
    } catch (error: any) {
      showAlert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <button className="back-button mb-6" onClick={() => navigate('/login')} type="button">
          <ChevronLeft size={16} />
          돌아가기
        </button>
        
        <h2 className="text-2xl mb-2 text-center">비밀번호 재설정</h2>
        <p className="text-secondary text-sm text-center mb-8">
          {isUsernameVerified ? '새로운 비밀번호를 입력해주세요.' : '가입하신 아이디를 입력해주세요.'}
        </p>
        
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="username">아이디</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                id="username" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input flex-1" 
                placeholder="아이디를 입력하세요"
                disabled={isUsernameVerified}
              />
              {!isUsernameVerified && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleVerifyUsername}
                  disabled={isLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  확인
                </button>
              )}
            </div>
            {isUsernameVerified && <span className="text-sm text-green-600 mt-1 block">확인 완료된 아이디입니다.</span>}
          </div>
          
          {isUsernameVerified && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">새 비밀번호</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="form-input" 
                  placeholder="7자 이상 입력하세요"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label" htmlFor="confirmPassword">새 비밀번호 확인</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input" 
                  placeholder="다시 한번 입력하세요"
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
                  {isLoading ? '변경 중...' : '비밀번호 변경하기'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
