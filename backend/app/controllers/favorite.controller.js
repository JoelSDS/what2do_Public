const Favorite = require("../models/favorite.model.js");
const User = require("../models/user.model.js");

exports.findAllUserFavorites = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.account.id !== userId) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const favorites = await Favorite.find({
      fav_uti_id: userId,
    });
    if (!favorites || favorites.length === 0) {
      return res.status(404).json({ message: "Aucun favori trouvé" });
    }
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.findAllUserFavoritesWithPreview = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.account.id !== userId) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const favorites = await Favorite.find({
      fav_uti_id: userId,
    }).populate("fav_eta_id", "id eta_name eta_logo eta_address");
    if (!favorites || favorites.length === 0) {
      return res.json([]);
    }
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.createUserFavorite = async (req, res) => {
  try {
    const userId = req.params.id;
    const establishmentId = req.body.fav_eta_id;
    if (req.account.id !== userId) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const user = await User.findById(userId);
    //test si le favori existe déj
    const existingFavorite = await Favorite.findOne({
      fav_uti_id: userId,
      fav_eta_id: establishmentId,
    });
    if (existingFavorite) {
      return res.status(400).json({
        message:
          "Cet établissement est déjà dans les favoris de cet utilisateur.",
      });
    }
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé !" });
    }
    const favorite = await Favorite.create({
      fav_date_of_add: new Date(),
      fav_uti_id: userId,
      fav_eta_id: establishmentId,
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.deleteUserFavorite = async (req, res) => {
  try {
    const userId = req.params.userId;
    const establishmentId = req.params.etaId;

    const favorite = await Favorite.findOneAndDelete({
      fav_uti_id: userId,
      fav_eta_id: establishmentId,
    });
    if (!favorite) {
      return res.status(404).json({ message: "Favori non trouvé" });
    }
    res.status(200).json({ message: "Favori supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
