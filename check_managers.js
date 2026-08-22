const mysql = require('mysql2/promise');
async function run() {
    const connection = await mysql.createConnection({host: 'localhost', user: 'root', password: '9621', database: 'matching_db'});
    const [rows] = await connection.execute('SELECT id, emp_no, name FROM manager');
    console.log(rows);
    process.exit(0);
}
run();
