const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/MemberInquiry.tsx', 'utf8');

// Add State
content = content.replace(
  "const [detailMember, setDetailMember] = useState<Member | null>(null);",
  "const [detailMember, setDetailMember] = useState<Member | null>(null);\n  const [memberTraits, setMemberTraits] = useState<Record<string, number> | null>(null);\n  const [showTraits, setShowTraits] = useState(false);"
);

// Add Handlers
const handlers = `
  const handleCloseDetailMember = () => {
    setDetailMember(null);
    setShowTraits(false);
    setMemberTraits(null);
  };

  const handleShowTraits = async () => {
    if (!detailMember) return;
    try {
      const response = await fetch(\`http://localhost:8080/api/members/\${detailMember.id}/traits\`);
      if (response.ok) {
        const data = await response.json();
        setMemberTraits(data);
        setShowTraits(show => !show);
      } else {
        alert('AI 성향 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('AI 성향 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };
`;
content = content.replace(
  "const handleRequestInfoView = async (targetMember: Member) => {",
  handlers + "\n  const handleRequestInfoView = async (targetMember: Member) => {"
);

// Replace onClick setDetailMember(null) -> handleCloseDetailMember
content = content.replace(/setDetailMember\(null\)/g, "handleCloseDetailMember()");

// Add button and traits section right above name box
const nameBox = `                  <div className="flex justify-between items-start mb-1">`;
const traitsSection = `
                  <div className="flex justify-end mb-2">
                    <button onClick={handleShowTraits} className="btn btn-sm" style={{ backgroundColor: '#6366f1', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>
                      ✨ AI성향분석
                    </button>
                  </div>
                  
                  {showTraits && (
                    <div style={{ backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #c7d2fe' }}>
                      <h4 className="font-bold text-indigo-900 mb-2">\uD83E\uDDE0 AI 추출 성향 수치</h4>
                      {memberTraits && Object.keys(memberTraits).length > 0 ? (
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                          {Object.entries(memberTraits).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-sm" style={{ backgroundColor: 'white', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                              <span className="text-gray-700">{key}</span>
                              <span className="font-bold text-indigo-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">추출된 성향 데이터가 없습니다.</div>
                      )}
                    </div>
                  )}
`;
content = content.replace(nameBox, traitsSection + nameBox);

fs.writeFileSync('frontend/src/pages/MemberInquiry.tsx', content, 'utf8');
console.log('Modified MemberInquiry correctly!');
