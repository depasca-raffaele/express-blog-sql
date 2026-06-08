import mysql from 'mysql2/promise';

export async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306
    });

    console.log('Connessione DB riuscita');
    return connection;
  } catch (error) {
    console.error('Errore connessione DB:', error.message);
    throw error;
  }
}