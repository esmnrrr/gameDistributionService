const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const Game = require("../models/game"); // Oyun modelini içe aktar
const User = require("../models/userModel"); 

// Yeni oyun ekleme
router.post("/add", async (req, res) => {
  try {
    const { gameTitle, gameImage } = req.body;
    if (!gameTitle || !gameImage) {
      return res.status(400).json({ message: "Başlık ve resim zorunludur" });
    }

    const game = new Game(req.body);
    await game.save();
    res.status(201).json({ message: "Oyun başarıyla eklendi", game });
  } catch (err) {
    console.error("Oyun ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// ✅ Tüm oyunları anasayfaya getir
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().sort({ _id: -1 });; // Tüm oyunları getir
    console.log("Dönen oyunlar:", games);
    res.json(games);
  } catch (err) {
    console.error("Oyunları çekerken hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Oyun detaylarını getir
router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate("comments.user", "username");
    if (!game) {
      return res.status(404).json({ message: "Oyun bulunamadı" });
    }
    res.json(game);
  } catch (err) {
    console.error("Oyun detayları yüklenirken hata:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
}); 

// Oyun silme
router.delete("/delete/:id", async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Oyun başarıyla silindi" });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// Yorum, puan ve play time ekleme

router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { rating, comment, play_time } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Puan ve yorum zorunludur" });
    }

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Oyun bulunamadı" });

    if (!game.comments) {
      game.comments = [];
    }

    game.comments.push({
      user: userId,
      username: req.user.username,
      rating: Number(rating),
      comment,
      date: new Date(),
    });

    await game.save();

    // ⭐️ Kullanıcının oynama süresini güncelle
    if (play_time && !isNaN(play_time)) {
      const user = await User.findById(userId);
      if (user) {
        const existing = user.playtimes.find(p => p.gameId.toString() === req.params.id);
    
        if (existing) {
          existing.duration += Number(play_time); // Mevcut sürenin üzerine ekle
        } else {
          user.playtimes.push({
            gameId: req.params.id,
            duration: Number(play_time),
          });
        }
    
        await user.save();
      }
    }

    res.status(200).json({ message: "Yorum eklendi", game });
  } catch (err) {
    console.error("Yorum ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

module.exports = router;
