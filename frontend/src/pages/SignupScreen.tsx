import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function SignupScreen() {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // 회원가입 처리 로직 (Mock)
    alert('회원가입이 완료되었습니다. 로그인 해주세요.');
    navigate('/login');
  };

  return (
    <div className="center-screen" style={{ padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '400px' }}>
        <button className="back-button mb-6" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
          돌아가기
        </button>
        
        <h2 className="text-2xl mb-2 text-center">회원가입</h2>
        <p className="text-secondary text-sm text-center mb-8">새로운 계정을 생성하세요.</p>
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">이름</label>
            <input 
              type="text" 
              id="name" 
              className="form-input" 
              placeholder="홍길동"
              required 
            />
          </div>

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
              minLength={8}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full btn-lg">
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}
