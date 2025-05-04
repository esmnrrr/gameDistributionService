const express = require("express");
const router = express.Router();
const Game = require("../models/game"); 
const User = require("../models/userModel"); 
const { verifyToken, protect } = require("../middleware/authMiddleware");
const {
    registerUser,
    loginUser,
    getUserProfile,
    updatePlaytime
  } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile/:id", getUserProfile);


router.patch('/updateStats/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { field, increment } = req.body;

  try {
    const update = {};
    update[field] = increment; // hangi alan artacak (comments gibi)

    await User.findByIdAndUpdate(userId, { $inc: update });

    res.json({ message: 'Profil istatistikleri güncellendi!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Güncelleme başarısız.' });
  }
});

router.patch('/updatePlaytime/:userId', verifyToken, updatePlaytime); // Oynama süresi güncelleme işlemi



module.exports = router;
