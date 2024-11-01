import express from 'express';
import getDatabaseConnection from './db.js';
import 'dotenv/config'; // Assurez-vous que cela est ici pour charger les variables d'environnement
const app = express();


app.get('/', async (req, res) => {
    return res.status(200).json({"Hallo Liebe Maman": 'Morgen ist dein Geburstags, Alles gute Zum Geburstags Liebe Maman'});
});

app.get('/users', async (req, res) => {
    const conn = await getDatabaseConnection();
    try {
        const rows = await conn.query("SELECT * FROM users"); // Alle Benutzernamen abfragen
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Datenbankfehler', error: err });
    } finally {
        conn.release(); // Verbindung freigeben
    }
});

// Server starten
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
});