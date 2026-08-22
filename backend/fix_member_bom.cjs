const fs = require('fs');

function stripBom(filePath) {
    let content = fs.readFileSync(filePath);
    if (content.length >= 3 && content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
        fs.writeFileSync(filePath, content.slice(3));
        console.log("Stripped BOM from: " + filePath);
    }
}

stripBom('backmgr/src/main/java/com/matching/backmgr/service/MemberService.java');
