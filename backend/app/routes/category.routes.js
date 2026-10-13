const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller.js");

router.get("/categories", categoryController.findAll);
router.get("/categories/:id", categoryController.findById);
//ROUTES PROTOEGER POUR L'ADMIN
router.post("/categories", categoryController.create);
router.delete("/categories/:id", categoryController.delete);

module.exports = router;
