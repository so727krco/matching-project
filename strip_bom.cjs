const fs = require('fs');
const path = require('path');

function stripBom(filePath) {
    if (filePath.endsWith('.java')) {
        let content = fs.readFileSync(filePath);
        if (content.length >= 3 && content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
            console.log("Stripped BOM from: " + filePath);
            fs.writeFileSync(filePath, content.slice(3));
        }
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else {
            stripBom(fullPath);
        }
    });
}

walk('backend');
