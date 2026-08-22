const mysql = require('mysql2/promise');
async function check() {
    const conn = await mysql.createConnection({host: 'localhost', user: 'root', password: '9621', database: 'matching_db'});
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM member');
    console.log("Current members:", rows[0].count);
    await conn.end();
}
check();
