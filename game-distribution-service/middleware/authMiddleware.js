const jwt = require("jsonwebtoken");

const createToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username, 
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Yetkilendirme hatası" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // .env içinde tanımlanmalı
    req.user = decoded; // token içindeki kullanıcı bilgilerini req.user'a ekle
    next();
  } catch (err) {
    return res.status(401).json({ message: "Geçersiz token" });
  }
};

module.exports = { verifyToken, protect: verifyToken , createToken };
