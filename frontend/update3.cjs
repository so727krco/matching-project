const fs = require('fs');
let content = fs.readFileSync('src/pages/MemberInquiry.tsx', 'utf8');

content = content.replace(/setApprovalRequests,/g, '');
content = content.replace(/setApprovalRequests/g, ''); // just in case
content = content.replace(/managerName \?\.name/g, 'managerName');
content = content.replace(/managerName\?\.name/g, 'managerName');
content = content.replace(/managerName:\s*value/g, 'managerEmpNo: value'); // fix searchFilter

fs.writeFileSync('src/pages/MemberInquiry.tsx', content, 'utf8');
