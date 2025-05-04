const Game = require("../models/game");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Kullanıcı Kayıt
const registerUser = async (req, res) => {
  try {
    console.log("🟢 Register isteği alındı:", req.body);

    const { username, email, password } = req.body;

    // Kullanıcı var mı kontrol et
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("🔴 Kullanıcı zaten kayıtlı");
      return res.status(400).json({ message: "Bu e-posta ile kayıtlı kullanıcı zaten var." });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("🔐 Şifre hash'lendi");

    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    console.log("✅ Yeni kullanıcı oluşturuldu:", user);
    if (user) {
      res.status(201).json({ message: "Kullanıcı başarıyla kaydedildi!" });
    } else {
      res.status(400).json({ message: "Geçersiz kullanıcı verisi" });
    }
  } catch (error) {

    console.error("🔥 Register Hatası:", error);
    
    res.status(500).json({ message: error.message });
  }
};

// Giriş işlemi
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kullanıcıyı e-postaya göre bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Şifre doğru mu kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz şifre." });
    }

    // JWT token oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({
        token,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
        },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Kullanıcı Profil Bilgileri

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const games = await Game.find();

    let totalRating = 0;
    let commentCount = 0;

    // Kullanıcının yazdığı yorumları oyunlardan topla
    games.forEach(game => {
      game.comments.forEach(comment => {
        if (comment.user.toString() === userId) {
          totalRating += comment.rating || 0;
          commentCount++;
        }
      });
    });

    const averageRating = commentCount > 0 ? (totalRating / commentCount).toFixed(1) : 0;
    const totalPlaytime = user.playtimes.reduce((acc, curr) => acc + curr.duration, 0);

    res.status(200).json({
      username: user.username,
      email: user.email,
      ratings: averageRating,
      playtimes: totalPlaytime, 
      comments: commentCount
    });
  } catch (error) {
    console.error("Profil alınamadı:", error);
    res.status(500).json({ message: "Profil bilgileri alınamadı." });
  }
};

const updatePlaytime = async (req, res) => {
  const { userId } = req.params;
  const { gameId, duration } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const existingEntry = user.playtimes.find(pt => pt.gameId.toString() === gameId);

    if (existingEntry) {
      existingEntry.duration += duration;
    } else {
      user.playtimes.push({ gameId, duration });
    }

    await user.save();
    res.status(200).json({ message: "Oynama süresi güncellendi." });
  } catch (error) {
    console.error("Playtime güncellenirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Kullanıcı silme işlemi



module.exports = { registerUser, loginUser, getUserProfile, updatePlaytime };