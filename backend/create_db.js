require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'iuran_rt'}\`;`);
    console.log(`Database '${process.env.DB_NAME || 'iuran_rt'}' created or already exists.`);
    
    await connection.end();
  } catch (err) {
    console.error('Failed to create database:', err);
    process.exit(1);
  }
}

createDatabase();
