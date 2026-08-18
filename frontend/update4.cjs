const fs = require('fs');
let content = fs.readFileSync('src/pages/MemberInquiry.tsx', 'utf8');

content = content.replace(/managerName: ''/g, 'managerEmpNo: \'\'');
content = content.replace(/detailMember\.managerName \?\.name/g, 'detailMember.managerName');

fs.writeFileSync('src/pages/MemberInquiry.tsx', content, 'utf8');
