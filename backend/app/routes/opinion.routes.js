const express = require("express");
const router = express.Router();
const opinionController = require("../controllers/opinion.controller.js");
const isAuthenticated = require("../middleware/isAuthenticated.js");

router.get(
  "/establishments/:id/opinions",
  opinionController.findAllEstablishmentOpinion
);

router.get("/users/:id/opinions", opinionController.findAllUserOpinion);

//ROUTES PROTEGEE PAR ISAUTHENTICATED
//
router.get(
  "/users/:idUser/opinions/:idEstab",
  isAuthenticated,
  opinionController.findUserOpinionOfEstablishment
);
router.post(
  "/users/:id/opinions",
  isAuthenticated,
  opinionController.createUserOpinion
);
router.put(
  "/users/:id/opinions",
  isAuthenticated,
  opinionController.updateUserOpinion
);
router.delete(
  "/users/:id/opinions/:idOpi",
  isAuthenticated,
  opinionController.deleteUserOpinion
);

module.exports = router;
