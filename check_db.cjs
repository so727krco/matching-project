const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'matching_db'
  });
  
  const [rows] = await connection.execute('SELECT id, member_id FROM member_trait ORDER BY id DESC LIMIT 5');
  console.log("member_trait:", rows);
  
  const [members] = await connection.execute('SELECT id, name FROM member ORDER BY id DESC LIMIT 5');
  console.log("member:", members);
  
  connection.end();
}
check();
