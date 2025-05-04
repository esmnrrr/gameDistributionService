const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  playtimes: {
    type: [
      {
        gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
        duration: Number
      }
    ],
    default: []
  },
}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);
