import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Upload, Loader2, X, ShieldCheck } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

export default function MemberRegistration() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert } = usePopup();
  
  // States for basic info
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [job, setJob] = useState('');
  const [income, setIncome] = useState('');
  const [hobby, setHobby] = useState('');
  
  const [idealType, setIdealType] = useState('');
  const [intro, setIntro] = useState('');
  const [humanCaution, setHumanCaution] = useState('');
  
  // Contacts
  const [phone, setPhone] = useState('');
  const [kakaoId, setKakaoId] = useState('');

  // Photos
  const [photos, setPhotos] = useState<{ id: number; url: string; file?: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const idealTypeRef = useRef<HTMLTextAreaElement>(null);
  const introRef = useRef<HTMLTextAreaElement>(null);
  const humanCautionRef = useRef<HTMLTextAreaElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch member data for edit
      fetch(`http://localhost:8080/api/members/${id}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name || '');
          setGender(data.gender === 'M' ? 'male' : 'female');
          setAge(data.age?.toString() || '');
          setJob(data.job || '');
          setIncome(data.salary || '');
          setHobby(data.hobbies || '');
          setIdealType(data.idealType || '');
          setIntro(data.introduction || '');
          setHumanCaution(data.remarks || '');
          setPhone(data.phoneNumber || '');
          setKakaoId(data.kakaoId || '');
          
          const loadedPhotos: { id: number; url: string; rawUrl: string; isExisting: boolean; file?: File }[] = [];
          const urls = [data.imageUrl1, data.imageUrl2, data.imageUrl3, data.imageUrl4, data.imageUrl5];
          urls.forEach((url, index) => {
            if (url) {
              loadedPhotos.push({
                id: Date.now() + index,
                url: 'http://localhost:8080' + url,
                rawUrl: url,
                isExisting: true
              });
            }
          });
          setPhotos(loadedPhotos as any);
        })
        .catch(err => {
          console.error(err);
          showAlert('회원 정보를 불러오는 데 실패했습니다.');
        });
    }
  }, [id]);

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
      showAlert('사진은 최대 5장까지만 업로드할 수 있습니다.');
      return;
    }

    const newPhotoObjects = filesArray.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file), // for preview
      file: file // for backend
    }));
    
    setPhotos(prev => [...prev, ...newPhotoObjects as any]);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: number) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasPhone = phone && phone.trim().length > 0;
    const hasKakao = kakaoId && kakaoId.trim().length > 0;
    
    if (!hasPhone && !hasKakao) {
      showAlert('휴대전화번호 또는 카카오톡 ID 중 하나는 필수입니다.');
      return;
    }

    const managerId = localStorage.getItem('managerId');
    if (!managerId) {
      showAlert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('gender', gender === 'male' ? 'M' : 'F');
      formData.append('age', age);
      formData.append('height', '0');
      formData.append('job', job);
      formData.append('salary', income ? income : '0');
      if (phone) formData.append('phoneNumber', phone);
      if (kakaoId) formData.append('kakaoId', kakaoId);
      if (hobby) formData.append('hobbies', hobby);
      if (idealType) formData.append('idealType', idealType);
      if (intro) formData.append('introduction', intro);
      if (humanCaution) formData.append('remarks', humanCaution);
      formData.append('managerId', managerId);

      // Append existing urls and new files
      photos.forEach(photo => {
        if ((photo as any).isExisting) {
          formData.append('existingUrls', (photo as any).rawUrl);
        } else if (photo.file) {
          formData.append('photoFiles', photo.file);
        }
      });

      const url = id ? `http://localhost:8080/api/members/${id}` : 'http://localhost:8080/api/members';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || (id ? '회원 수정에 실패했습니다.' : '회원 등록에 실패했습니다.'));
      }

      showAlert(id ? '회원 정보가 성공적으로 수정되었습니다.' : '회원 등록이 완료되었습니다.\nAI 사진 및 프로필 검증이 무사히 통과되었습니다.', () => {
        if (id) {
          navigate('/members', { state: { openDetailId: Number(id) } });
        } else {
          navigate('/main');
        }
      });
    } catch (error: any) {
      console.error('Registration/Update error:', error);
      if (error.message.includes('429') || error.message.includes('Rate Limit')) {
         showAlert('AI API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      } else {
         showAlert(error.message || '등록 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container bg-gray-50">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate('/main')} type="button">
          <ChevronLeft size={20} />
          <span>메인으로</span>
        </button>
        <div className="app-title text-base">{id ? '회원 정보 수정' : '신규 회원 등록'}</div>
        <div style={{ width: '80px' }}></div>
      </header>
      
      <main className="main-content">
        <div className="card max-w-2xl mx-auto" style={{ padding: '2rem' }}>
          {id ? (
            <div className="flex justify-between items-start mb-6 pb-4 border-b">
              {/* 왼쪽 여백 (타이틀 중앙 정렬용) */}
              <div style={{ flex: 1 }}></div>
              
              {/* 중앙 타이틀 */}
              <div className="text-center" style={{ flex: 2 }}>
                <h2 className="text-2xl font-bold mb-2">회원 정보 수정</h2>
                <p className="text-secondary text-sm m-0">기본 정보 및 연락처, 프로필 사진을 수정해주세요.</p>
              </div>

              {/* 우측 버튼 */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-sm" 
                  onClick={() => navigate('/members', { state: { openDetailId: Number(id) } })} 
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    backgroundColor: '#fee2e2', 
                    color: '#ef4444',           
                    border: '1px solid #fca5a5',
                    cursor: 'pointer'
                  }}>
                  수정 취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl mb-2 text-center font-bold">신규 회원 등록</h2>
              <p className="text-secondary text-sm text-center mb-8">기본 정보 및 연락처, 프로필 사진을 입력해주세요.</p>
            </>
          )}
          
          <form onSubmit={handleRegister}>
            {/* 1. 기본 정보 */}
            <h3 className="font-semibold text-lg mb-4 pb-2 border-b">1. 기본 정보</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="name">이름</label>
              <input type="text" id="name" className="form-input" placeholder="홍길동" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group" style={{ flexDirection: 'row', gap: 'var(--spacing-4)' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="gender">성별</label>
                <select id="gender" className="form-select" value={gender} onChange={e => setGender(e.target.value)} required>
                  <option value="" disabled>선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="age">나이</label>
                <input type="number" id="age" className="form-input" placeholder="30" value={age} onChange={e => setAge(e.target.value)} required min="18" max="100" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="job">직업</label>
              <input type="text" id="job" className="form-input" placeholder="개발자" value={job} onChange={e => setJob(e.target.value)} required />
            </div>

            <div className="form-group mb-8">
              <label className="form-label" htmlFor="income">연소득</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <input type="number" id="income" className="form-input" placeholder="5000" value={income} onChange={e => setIncome(e.target.value)} required min="0" style={{ flex: 1 }} />
                <span className="text-secondary text-sm flex-shrink-0">만원</span>
              </div>
            </div>

            {/* 2. 연락처 정보 */}
            <h3 className="font-semibold text-lg mb-4 pb-2 border-b">2. 연락처 (알림톡/매칭 진행용)</h3>
            <div className="form-group" style={{ flexDirection: 'row', gap: 'var(--spacing-4)' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="phone">휴대전화번호 (또는 카톡 필수)</label>
                <input type="tel" id="phone" className="form-input" placeholder="010-0000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="kakaoId">카카오톡 ID (또는 전화 필수)</label>
                <input type="text" id="kakaoId" className="form-input" placeholder="ID 입력" value={kakaoId} onChange={e => setKakaoId(e.target.value)} />
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
                        <button 
                          type="button"
                          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 z-10 hover:bg-red-500"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <X size={14} />
                        </button>
                        <img src={photo.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
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
              <input type="text" id="hobby" className="form-input" placeholder="독서, 영화감상" value={hobby} onChange={e => setHobby(e.target.value)} required />
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
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              {id ? '회원 정보 수정 완료' : '회원 등록 완료'}
            </button>
          </form>
        </div>
      </main>

      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <div className="text-lg font-bold text-gray-800">AI가 프로필과 사진을 심층 분석 중입니다...</div>
          <div className="text-sm text-gray-500 mt-2">최대 10초 정도 소요될 수 있습니다.</div>
        </div>
      )}
    </div>
  );
}
