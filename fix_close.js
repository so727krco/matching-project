const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/MemberInquiry.tsx', 'utf8');

content = content.replace(
  "  const handleCloseDetailMember = () => {\n    handleCloseDetailMember();",
  "  const handleCloseDetailMember = () => {\n    setDetailMember(null);"
);

fs.writeFileSync('frontend/src/pages/MemberInquiry.tsx', content, 'utf8');
console.log('Fixed infinite recursion');
