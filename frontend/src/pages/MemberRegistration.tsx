import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, CheckCircle2, AlertCircle, Loader2, X, ShieldCheck } from 'lucide-react';

type PhotoStatus = 'verifying' | 'success' | 'fail_no_face' | 'fail_mismatch';

export default function MemberRegistration() {
  const navigate = useNavigate();
  const [idealType, setIdealType] = useState('');
  const [intro, setIntro] = useState('');
  const [humanCaution, setHumanCaution] = useState('');
  
  // Contacts
  const [phone, setPhone] = useState('');
  const [kakaoId, setKakaoId] = useState('');

  // Photos
  const [photos, setPhotos] = useState<{ id: number; url: string; status: PhotoStatus }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const idealTypeRef = useRef<HTMLTextAreaElement>(null);
  const introRef = useRef<HTMLTextAreaElement>(null);
  const humanCautionRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = (ref: React.RefObject<HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    if (photos.length + filesArray.length > 5) {
      alert('사진은 최대 5장까지만 업로드할 수 있습니다.');
      return;
    }

    const newPhotoObjects = filesArray.map((file, idx) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file), // create local preview URL
      status: 'verifying' as PhotoStatus
    }));

    setPhotos(prev => [...prev, ...newPhotoObjects]);

    // AI Mock Verification
    newPhotoObjects.forEach((photo, idx) => {
      setTimeout(() => {
        setPhotos(prev => {
          const updated = [...prev];
          const targetIndex = updated.findIndex(p => p.id === photo.id);
          if (targetIndex !== -1) {
            // Mock probability logic: 
            // 80% Success, 10% No Face (landscape etc), 10% Mismatch
            const rand = Math.random();
            let resultStatus: PhotoStatus = 'success';
            
            if (rand < 0.1) resultStatus = 'fail_no_face';
            else if (targetIndex > 0 && rand < 0.2) resultStatus = 'fail_mismatch';
            
            updated[targetIndex].status = resultStatus;
          }
          return updated;
        });
      }, 1500 + idx * 800); // 1.5s delay + staggered
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: number) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.some(p => p.status === 'verifying')) {
      alert('AI 사진 검증이 진행 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    if (photos.some(p => p.status.startsWith('fail'))) {
      alert('검증에 실패한 사진이 있습니다. 삭제 후 다시 업로드해주세요.');
      return;
    }
    
    alert('회원이 성공적으로 등록되었습니다.');
    navigate('/main');
  };

  return (
    <div className="app-container bg-gray-50">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate('/main')}>
          <ChevronLeft size={20} />
          <span>메인으로</span>
        </button>
        <div className="app-title text-base">회원등록</div>
        <div style={{ width: '80px' }}></div>
      </header>
      
      <main className="main-content">
        <div className="card max-w-2xl mx-auto" style={{ padding: '2rem' }}>
          <h2 className="text-2xl mb-2 text-center font-bold">신규 회원 등록</h2>
          <p className="text-secondary text-sm text-center mb-8">기본 정보 및 연락처, 프로필 사진을 입력해주세요.</p>
          
          <form onSubmit={handleRegister}>
            {/* 1. 기본 정보 */}
            <h3 className="font-semibold text-lg mb-4 pb-2 border-b">1. 기본 정보</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="name">이름</label>
              <input type="text" id="name" className="form-input" placeholder="홍길동" required />
            </div>

            <div className="form-group" style={{ flexDirection: 'row', gap: 'var(--spacing-4)' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="gender">성별</label>
                <select id="gender" className="form-select" defaultValue="" required>
                  <option value="" disabled>선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="age">나이</label>
                <input type="number" id="age" className="form-input" placeholder="30" required min="18" max="100" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="job">직업</label>
              <input type="text" id="job" className="form-input" placeholder="개발자" required />
            </div>

            <div className="form-group mb-8">
              <label className="form-label" htmlFor="income">연소득</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <input type="number" id="income" className="form-input" placeholder="5000" required min="0" style={{ flex: 1 }} />
                <span className="text-secondary text-sm flex-shrink-0">만원</span>
              </div>
            </div>

            {/* 2. 연락처 정보 */}
            <h3 className="font-semibold text-lg mb-4 pb-2 border-b">2. 연락처 (알림톡/매칭 진행용)</h3>
            <div className="form-group" style={{ flexDirection: 'row', gap: 'var(--spacing-4)' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="phone">휴대전화번호</label>
                <input type="tel" id="phone" className="form-input" placeholder="010-0000-0000" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="kakaoId">카카오톡 ID</label>
                <input type="text" id="kakaoId" className="form-input" placeholder="ID 입력" value={kakaoId} onChange={e => setKakaoId(e.target.value)} required />
              </div>
            </div>

            {/* 3. 사진 업로드 및 AI 검증 */}
            <h3 className="font-semibold text-lg mt-8 mb-4 pb-2 border-b flex items-center gap-2">
              3. 프로필 사진 및 AI 검증 <ShieldCheck size={18} className="text-primary" />
            </h3>
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="form-label mb-0">사진 업로드 ({photos.length}/5)</label>
                <button 
                  type="button"
                  className="btn btn-outline" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photos.length >= 5}
                >
                  <Upload size={14} className="mr-1" /> 사진 추가
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/png, image/jpeg, image/jpg" 
                  multiple 
                  style={{ display: 'none' }} 
                />
              </div>
              
              <div className="flex flex-col gap-3">
                {photos.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 border border-dashed rounded-lg text-secondary text-sm">
                    얼굴이 명확히 나온 사진을 업로드해주세요. <br/>
                    AI가 동일인 여부를 자동으로 검증합니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={photo.id} className="relative border rounded-lg overflow-hidden bg-gray-50 flex flex-col" style={{ aspectRatio: '3/4' }}>
                        {/* Remove button */}
                        <button 
                          type="button"
                          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 z-10 hover:bg-red-500"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <X size={14} />
                        </button>

                        <img src={photo.url} alt={`Preview ${index}`} className="w-full h-full object-cover" style={{ filter: photo.status === 'verifying' ? 'blur(2px)' : 'none' }} />
                        
                        {/* AI Status Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-2 text-xs flex items-center justify-center font-medium" style={{
                          backgroundColor: 
                            photo.status === 'verifying' ? 'rgba(0,0,0,0.6)' :
                            photo.status === 'success' ? 'rgba(22, 163, 74, 0.9)' : 
                            'rgba(220, 38, 38, 0.9)',
                          color: 'white'
                        }}>
                          {photo.status === 'verifying' && <><Loader2 size={12} className="animate-spin mr-1" /> AI 분석 중...</>}
                          {photo.status === 'success' && <><CheckCircle2 size={12} className="mr-1" /> 본인 인증 완료 (99%)</>}
                          {photo.status === 'fail_no_face' && <><AlertCircle size={12} className="mr-1" /> 얼굴 인식 불가</>}
                          {photo.status === 'fail_mismatch' && <><AlertCircle size={12} className="mr-1" /> 동일인 불일치 (도용 의심)</>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. 상세 성향 */}
            <h3 className="font-semibold text-lg mt-8 mb-4 pb-2 border-b">4. 상세 성향 및 관리자 메모</h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="hobby">취미</label>
              <input type="text" id="hobby" className="form-input" placeholder="독서, 영화감상" required />
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label className="form-label" htmlFor="idealType">이상형</label>
                <span className="text-secondary text-xs">{idealType.length} / 1000</span>
              </div>
              <textarea 
                id="idealType" 
                ref={idealTypeRef}
                className="form-textarea" 
                style={{ overflow: 'hidden', minHeight: '46px', resize: 'none' }}
                rows={1}
                placeholder="대화가 잘 통하는 사람" 
                maxLength={1000}
                value={idealType}
                onChange={(e) => {
                  setIdealType(e.target.value);
                  handleResize(idealTypeRef as React.RefObject<HTMLTextAreaElement>);
                }}
                required 
              />
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label className="form-label" htmlFor="intro">자기소개</label>
                <span className="text-secondary text-xs">{intro.length} / 3000</span>
              </div>
              <textarea 
                id="intro" 
                ref={introRef}
                className="form-textarea" 
                style={{ overflow: 'hidden', resize: 'none' }}
                rows={3}
                placeholder="안녕하세요! 저는..." 
                maxLength={3000}
                value={intro}
                onChange={(e) => {
                  setIntro(e.target.value);
                  handleResize(introRef as React.RefObject<HTMLTextAreaElement>);
                }}
                required
              ></textarea>
            </div>

            <div className="form-group mb-8">
              <div className="flex justify-between items-center">
                <label className="form-label" htmlFor="humanCaution">주의사항 (매니저만 열람 가능)</label>
                <span className="text-secondary text-xs">{humanCaution.length} / 2000</span>
              </div>
              <textarea 
                id="humanCaution" 
                ref={humanCautionRef}
                className="form-textarea" 
                style={{ overflow: 'hidden', minHeight: '46px', resize: 'none', backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}
                rows={1}
                placeholder="매니저가 직접 입력하는 주의사항" 
                maxLength={2000}
                value={humanCaution}
                onChange={(e) => {
                  setHumanCaution(e.target.value);
                  handleResize(humanCautionRef as React.RefObject<HTMLTextAreaElement>);
                }}
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              회원 등록 완료
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
