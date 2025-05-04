require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ HATA: MONGO_URI tanımlanmamış! .env dosyanı kontrol et.");
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB bağlantısı başarılı!");
  } catch (error) {
    console.error("❌ MongoDB bağlantı hatası:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
