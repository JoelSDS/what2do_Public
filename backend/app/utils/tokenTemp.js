const crypto = require("crypto");

exports.generateEmailToken = () => {
  return crypto.randomBytes(32).toString("hex"); // 64 caractères sécurisés
};
