const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/MemberInquiry.tsx', 'utf8');
content = content.replace(/'010-1234-5678'/g, "'정보 없음'");
content = content.replace(/'kakao_123'/g, "'정보 없음'");
fs.writeFileSync('frontend/src/pages/MemberInquiry.tsx', content, 'utf8');

let content2 = fs.readFileSync('frontend/src/pages/MemberMatching.tsx', 'utf8');
content2 = content2.replace(/'010-1234-5678'/g, "'정보 없음'");
content2 = content2.replace(/'kakao_123'/g, "'정보 없음'");
fs.writeFileSync('frontend/src/pages/MemberMatching.tsx', content2, 'utf8');

console.log('Fixed fallbacks');
