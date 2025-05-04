require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const gameRoutes = require('./routes/gameRoutes');

dotenv.config();
const app = express();

// MongoDB'ye bağlan
connectDB();

app.use(express.json());
app.use(cors());

app.use("/users", require("./routes/userRoutes"));
app.use("/api/games", gameRoutes); // API için oyun rotaları

// Anasayfa
app.get('/', (req, res) => {
    res.send('🎮 Welcome to Game Distribution API!');
});

// Oyunları listeleme endpoint'i
app.get('/games', (req, res) => {
    res.json([
        { id: 1, name: "Game 1", genre: "Action" },
        { id: 2, name: "Game 2", genre: "Adventure" }
    ]);
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor!`);
});

  