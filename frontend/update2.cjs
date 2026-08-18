const fs = require('fs');
let content = fs.readFileSync('src/pages/MemberInquiry.tsx', 'utf8');

content = content.replace(/setApprovalRequests,/g, '');
content = content.replace(/managerName\.name/g, 'managerName');
content = content.replace(/detailMember\.hobbies/g, 'detailMember.hobby');
content = content.replace(/detailMember\.introduction/g, 'detailMember.intro');
content = content.replace(/detailMember\.remarks/g, 'detailMember.humanCaution');

fs.writeFileSync('src/pages/MemberInquiry.tsx', content, 'utf8');
