const mysql=require('mysql2/promise');
(async()=>{
    const c=await mysql.createConnection({host:'localhost',user:'root',password:'9621',database:'matching_db'});
    await c.execute('ALTER TABLE ai_config ADD COLUMN api_url VARCHAR(500)');
    await c.execute('UPDATE ai_config SET api_url="https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"');
    console.log('Fixed DB schema for ai_config');
    await c.end();
})();
