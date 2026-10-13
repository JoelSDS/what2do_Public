const express = require("express");
const router = express.Router();
const establishmentController = require("../controllers/establishment.controller.js");
const isAuthenticated = require("../middleware/isAuthenticated.js");

router.get("/establishments", establishmentController.findAll);
router.get("/establishments/:id", establishmentController.findById);
router.post("/establishments", establishmentController.create);
//ROUTES PROTEGER PAR ISAUTHENTICATED
router.put(
  "/establishments/:id",
  isAuthenticated,
  establishmentController.update
);
router.delete(
  "/establishments/:id",
  isAuthenticated,
  establishmentController.delete
);

module.exports = router;
