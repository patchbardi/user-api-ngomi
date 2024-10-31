
import express from 'express';
import db from './db.js'; // Assurez-vous d'ajouter l'extension .js
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({"Hallo maman ": "am 2.11 hast du Geburstags"});
});

// Nouvelle route pour récupérer les utilisateurs
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
const PORT = process.env.PORT || 3000; // Utilise le port défini dans l’environnement ou 3000 par défaut
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
