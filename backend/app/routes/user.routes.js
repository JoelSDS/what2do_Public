const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const isAuthenticated = require("../middleware/isAuthenticated.js");

router.get("/users", userController.findAll);
router.get("/users/:id", userController.findById);
router.post("/users", userController.create);
//ROUTES PROTEGER PAR ISAUTHENTICATED
router.put("/users/:id", isAuthenticated, userController.update);
router.delete("/users/:id", isAuthenticated, userController.delete);

module.exports = router;
