import express from 'express';
import getDatabaseConnection from './db.js';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

// Middleware, um json zu verarbeiten
app.use(express.json());

app.use(cors({
    origin: process.env.HOST, // React-URL
    // origin: '*', // Everything-URL
    credentials: true         // Erlaubt das Senden von Cookies, falls benötigt
}));

// Authentifizierungs-Middleware
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Nicht autorisiert' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(403).json({ error: 'Token ungültig' });
    }
};

app.get('/', async (req, res) => {
    return res.status(200).json({hello: 'world'});
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

app.get('/api/profile', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    const conn = await getDatabaseConnection();
    try {
        const [userResult] = await conn.query(
            `SELECT u.name, p.bio
             FROM users u
             LEFT JOIN user_profile p ON u.id = p.user_id
             WHERE u.id = ?`,
            [userId]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ error: 'Profil nicht gefunden' });
        }

        res.json(userResult);

    } catch (error) {
        console.error('Fehler beim Abrufen des Profils:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen des Profils' });
    } finally {
        conn.release();
    }
});

// Server starten
app.listen(process.env.PORT, () => {
    console.log(`Server läuft auf http://localhost:${process.env.PORT}`);
});