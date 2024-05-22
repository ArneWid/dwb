import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: 'http://dwb.local:499',
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: ['Content-Type', 'X-API-KEY']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight-OPTIONS-Anfragen für alle Routen zulassen

// Ersetze diesen API-Key durch deinen echten API-Key
const API_KEY = 'ixa_FRQn7NvqsgnDbFeqQMbRQVL8pZCtTWP6uug899';

// __dirname und __filename in ES-Modulen ermitteln
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API-Routen
app.get('/api/resources', async (req, res) => {
  try {
    const response = await fetch('https://portal.kreis-rd.local/api/app/8F6FD6987CA7968D9D3334EC221BA3671F4D7D02/Ressources', {
      headers: {
        'X-API-KEY': API_KEY
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Fehler beim Laden der Ressourcen:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Ressourcen', details: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const response = await fetch('https://portal.kreis-rd.local/api/app/8F6FD6987CA7968D9D3334EC221BA3671F4D7D02/Events', {
      headers: {
        'X-API-KEY': API_KEY
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Fehler beim Laden der Events:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Events', details: error.message });
  }
});

// Statische Dateien bedienen (React App)
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
