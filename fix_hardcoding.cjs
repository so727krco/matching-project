const fs = require('fs');

// 1. MemberInquiry.tsx
let mi = fs.readFileSync('C:/Users/so727/matching-project/frontend/src/pages/MemberInquiry.tsx', 'utf8');
mi = mi.replace(/const getCurrentUser\(\) = '매니저A'; \/\/ Mock logged-in manager\r?\n?/, '');
mi = mi.replace(/const CURRENT_MANAGER = '매니저A'; \/\/ Mock logged-in manager\r?\n?/, '');
fs.writeFileSync('C:/Users/so727/matching-project/frontend/src/pages/MemberInquiry.tsx', mi, 'utf8');

// 2. MatchingManagement.tsx
let mm = fs.readFileSync('C:/Users/so727/matching-project/frontend/src/pages/MatchingManagement.tsx', 'utf8');
mm = mm.replace(/managerName: '매니저A'/g, 'managerName: getCurrentUser()');
fs.writeFileSync('C:/Users/so727/matching-project/frontend/src/pages/MatchingManagement.tsx', mm, 'utf8');

// 3. MemberMatching.tsx
let memm = fs.readFileSync('C:/Users/so727/matching-project/frontend/src/pages/MemberMatching.tsx', 'utf8');
memm = memm.replace(/managerName: '매니저A'/g, 'managerName: getCurrentUser()');
fs.writeFileSync('C:/Users/so727/matching-project/frontend/src/pages/MemberMatching.tsx', memm, 'utf8');

// 4. AdminDashboard.tsx
let ad = fs.readFileSync('C:/Users/so727/matching-project/frontend/src/pages/AdminDashboard.tsx', 'utf8');
// Replace managers array fetching
ad = ad.replace(/const managers = \['매니저A', '매니저B'\];[^\n]*/, 
                "// Extract distinct managers from member list\n    const managers = Array.from(new Set(members.map(m => m.managerName).filter(Boolean)));");
fs.writeFileSync('C:/Users/so727/matching-project/frontend/src/pages/AdminDashboard.tsx', ad, 'utf8');

