const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated.js");
const favoriteController = require("../controllers/favorite.controller.js");
//ROUTES PROTEGER PAR ISAUTHENTICATED

router.get(
  "/users/:id/favorites",
  isAuthenticated,
  favoriteController.findAllUserFavorites
);
router.get(
  "/users/:id/favorites/preview",
  isAuthenticated,
  favoriteController.findAllUserFavoritesWithPreview
);
router.post(
  "/users/:id/favorites",
  isAuthenticated,
  favoriteController.createUserFavorite
);
router.delete(
  "/users/:userId/favorites/:etaId",
  isAuthenticated,
  favoriteController.deleteUserFavorite
);

module.exports = router;
