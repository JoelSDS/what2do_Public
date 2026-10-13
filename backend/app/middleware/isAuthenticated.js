const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Vérifie si le header existe
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide." });
  }

  const token = authHeader.split(" ")[1]; // extrait le token

  try {
    // 2. Vérifie le token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Enregistre les infos du token dans req.account
    req.account = decoded;

    // 4. Passe à la route suivante
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

module.exports = isAuthenticated;
