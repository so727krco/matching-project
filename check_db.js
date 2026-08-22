const mysql = require('mysql2/promise');
async function check() {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '9621', database: 'matching_db' });
    const [rows] = await conn.execute('SELECT id, name, hobbies, introduction FROM member ORDER BY id DESC LIMIT 5;');
    console.log('RECENT MEMBERS:', rows);
    conn.end();
  } catch(e) {
    console.error(e);
  }
}
check();
