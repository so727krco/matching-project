import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus, LogIn } from 'lucide-react';

export default function InitialScreen() {
  const navigate = useNavigate();

  return (
    <div className="center-screen">
      <div className="card text-center" style={{ maxWidth: '400px' }}>
        <div className="mb-6 flex justify-center mt-4">
          <Heart size={64} color="var(--color-primary)" />
        </div>
        <h1 className="text-3xl mb-2">HeartSync</h1>
        <p className="text-secondary mb-8">당신에게 딱 맞는 인연을 찾아보세요.</p>
        
        <div className="flex flex-col gap-3">
          <button 
            className="btn btn-primary btn-full btn-lg"
            onClick={() => navigate('/login')}
          >
            <LogIn size={20} />
            로그인
          </button>
          
          <button 
            className="btn btn-outline btn-full btn-lg"
            onClick={() => navigate('/signup')}
          >
            <UserPlus size={20} />
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
