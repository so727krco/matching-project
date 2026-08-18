const fs = require('fs');
let content = fs.readFileSync('backend/backmgr/src/main/java/com/matching/backmgr/service/ManagerService.java', 'utf8');

content = content.replace(/manager\.setName\(SecurityUtil\.maskName\(manager\.getName\(\)\)\);/g, '// manager.setName(SecurityUtil.maskName(manager.getName()));');

fs.writeFileSync('backend/backmgr/src/main/java/com/matching/backmgr/service/ManagerService.java', content, 'utf8');

let dummyContent = fs.readFileSync('backend/backapp/src/main/java/com/matching/backapp/controller/DummyDataController.java', 'utf8');
dummyContent = dummyContent.replace(/\.name\(SecurityUtil\.maskName\(name\)\)/g, '.name(name)');
fs.writeFileSync('backend/backapp/src/main/java/com/matching/backapp/controller/DummyDataController.java', dummyContent, 'utf8');
