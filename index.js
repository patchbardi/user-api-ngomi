import express from 'express';
import getDatabaseConnection from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
app.use(express.json()); // Pour analyser les requêtes JSON

app.use(cors({
    origin: process.env.HOST, // React-URL
    // origin: '*', // Everything-URL
    credentials: true         // Erlaubt das Senden von Cookies, falls benötigt
}));

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

// Anmeldung
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(username);
    console.log(password);

    const conn = await getDatabaseConnection();
    let user;
    try {
        [user] = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
    } catch (error) {
        console.log(error);
    } finally {
        conn.release();
    }
    if (!user) return res.status(400).json({ error: 'Benutzer nicht gefunden' });

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) return res.status(400).json({ error: 'Falsches Passwort' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user.id });
});

// Server starten
app.listen(process.env.PORT, () => {
    console.log(`Server läuft auf http://localhost:${process.env.PORT}`);
});