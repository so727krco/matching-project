const fs = require('fs');
let content = fs.readFileSync('src/pages/MainScreen.tsx', 'utf8');

content = content.replace(/import \{ getApprovalRequests \} from '\.\.\/utils\/storage';/g, '');
content = content.replace(/const CURRENT_MANAGER = '[^']+';/g, '');

fs.writeFileSync('src/pages/MainScreen.tsx', content, 'utf8');
