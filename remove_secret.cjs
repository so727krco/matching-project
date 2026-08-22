const fs = require('fs');

// Remove from AiConfigInitializer
let ai = fs.readFileSync('backend/backapp/src/main/java/com/matching/backapp/config/AiConfigInitializer.java', 'utf8');
ai = ai.replace(/String realApiKey = ".*?";/, 'String realApiKey = "YOUR_GEMINI_API_KEY_HERE";');
fs.writeFileSync('backend/backapp/src/main/java/com/matching/backapp/config/AiConfigInitializer.java', ai, 'utf8');

// Remove from test_gemini.js
let test = fs.readFileSync('test_gemini.js', 'utf8');
test = test.replace(/const API_KEY\s*=\s*['"].*?['"];/, "const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';");
fs.writeFileSync('test_gemini.js', test, 'utf8');
