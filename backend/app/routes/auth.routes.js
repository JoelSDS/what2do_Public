const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.get("/verify-email", authController.verifyEmailToken);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.passwordReset);
module.exports = router;
