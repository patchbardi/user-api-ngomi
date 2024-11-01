
import express from 'express';
import getDatabaseConnection from '../db.js'; // Corrected path if db.js is in the parent directory

const router = express.Router();

router.get('/', async (req, res) => {
    const conn = await getDatabaseConnection();
    try {
        const rows = await conn.query('SELECT * FROM users');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Fehler beim Abrufen der Nutzerdaten:", error);
        res.status(500).send("Fehler beim Abrufen der Nutzerdaten");
    } finally {
        conn.release();
    }
});

export default router;