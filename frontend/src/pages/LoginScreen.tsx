import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function LoginScreen() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 로그인 처리 (Mock)
    navigate('/main');
  };

  return (
    <div className="center-screen">
      <div className="card" style={{ maxWidth: '400px' }}>
        <button className="back-button mb-6" onClick={() => navigate('/')}>
          <ChevronLeft size={16} />
          돌아가기
        </button>
        
        <h2 className="text-2xl mb-2 text-center">로그인</h2>
        <p className="text-secondary text-sm text-center mb-8">계정에 로그인하여 서비스를 이용하세요.</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">이메일</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="example@domain.com"
              required 
            />
          </div>
          
          <div className="form-group mb-8">
            <label className="form-label" htmlFor="password">비밀번호</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              확인
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-full"
              onClick={() => navigate('/signup')}
            >
              회원가입하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
