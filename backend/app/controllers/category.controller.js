const Category = require("../models/category.model.js");

exports.findAll = async (req, res) => {
  try {
    const categories = await Category.find({}, "id cat_name cat_code");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.findById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id, "id cat_name");
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée !" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.create = async (req, res) => {
  try {
    const existingCategory = await Category.findOne({
      cat_name: req.body.cat_name,
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Cette catégorie existe déjà." });
    }
    const category = await Category.create({
      cat_name: req.body.cat_name,
      cat_code: req.body.cat_code,
    });
    res.status(201).json({ message: "Catégorie créée avec succès.", category });
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.delete = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée !" });
    }
    res.status(200).json({ message: "Catégorie supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};
