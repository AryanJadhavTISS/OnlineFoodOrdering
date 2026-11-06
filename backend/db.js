const mysql = require('mysql2/promise');

// A pool reuses connections and keeps database settings in one place.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'OnlineFoodOrdering',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true
});

module.exports = pool;
