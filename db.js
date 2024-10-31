// db.js

import mariadb from 'mariadb';
import 'dotenv/config';


const pool = mariadb.createPool({

  host: 'localhost', // ou votre hôte
  user: 'diane',
  password: 'Louise',
  database: 'project_db',
  connectionLimit: 5,
  
});

async function getDatabaseConnction() {
    try {
        const connection = await pool.getConnection();
        console.log("Erfolgreich mit der Datenbank verbunden");
        return connection;
    } catch (error) {
        console.error("Fehler bei der Verbindung zur Datenbank:", error);
        throw error;
    }
  }
  
  export default getDatabaseConnction;