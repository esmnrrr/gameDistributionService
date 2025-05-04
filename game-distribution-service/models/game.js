const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  rating: { type: Number, min: 1, max: 5},
  comment: { type: String},
  date: { type: Date, default: Date.now }
});

const gameSchema = new mongoose.Schema({
  gameTitle: { type: String },
  gameImage: { type: String},
  gameGenres: {type: [String]},
  gameDescription: { type: String },
  releaseDate: { type: String },
  comments: { type: [commentSchema] }
});


// Modeli oluştur
module.exports = mongoose.models.Game || mongoose.model("Game", gameSchema);