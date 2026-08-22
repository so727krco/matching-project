const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/MemberInquiry.tsx', 'utf8');

const oldTraitsSection = `                      {memberTraits && Object.keys(memberTraits).length > 0 ? (
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
                      )}`;

const newTraitsSection = `                      {memberTraits && Object.keys(memberTraits).length > 0 ? (
                        <>
                          <div className="grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                            {Object.entries(memberTraits).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center text-sm" style={{ backgroundColor: 'white', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-gray-700">{key}</span>
                                <span className="font-bold text-indigo-600">{value}</span>
                              </div>
                            ))}
                          </div>
                          {detailMember.aiRemarks && (
                            <div className="mt-2 p-3 bg-white rounded border border-indigo-100 text-sm text-gray-800">
                              <h5 className="font-bold text-indigo-800 mb-1">📝 AI 종합 분석 의견</h5>
                              <div style={{ whiteSpace: 'pre-wrap' }}>{detailMember.aiRemarks}</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">추출된 성향 데이터가 없습니다.</div>
                      )}`;

content = content.replace(oldTraitsSection, newTraitsSection);
fs.writeFileSync('frontend/src/pages/MemberInquiry.tsx', content, 'utf8');
console.log('Fixed UI for aiRemarks');
