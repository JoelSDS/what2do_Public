const Opinion = require("../models/opinion.model.js");

exports.findAllEstablishmentOpinion = async (req, res) => {
  try {
    const idEtab = req.params.id;
    const opinions = await Opinion.find({ opi_eta_id: idEtab })
      .populate("opi_uti_id", "uti_name uti_surname uti_image")
      .sort({ opi_date: -1 });
    if (!opinions || opinions.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun avis trouvé pour cet Etablissement." });
    }
    res.json(opinions);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.findAllUserOpinion = async (req, res) => {
  try {
    const idUser = req.params.id;
    const opinions = await Opinion.find({ opi_uti_id: idUser })
      .populate("opi_eta_id", "eta_name eta_logo")
      .sort({ opi_date: -1 });

    if (!opinions || opinions.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun commentaire trouvé pour cet utilisateur." });
    }
    res.json(opinions);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.findUserOpinionOfEstablishment = async (req, res) => {
  try {
    const idUser = req.params.idUser;
    const idEstab = req.params.idEstab;

    // Sécurité : empêcher de modifier un autre compte
    if (req.account.id !== idUser) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const opinions = await Opinion.findOne({
      opi_uti_id: idUser,
      opi_eta_id: idEstab,
    });

    if (!opinions || opinions.length === 0) {
      return res.json(null);
    }
    res.json(opinions);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.createUserOpinion = async (req, res) => {
  try {
    const idUser = req.params.id;
    const idEstab = req.body.opi_eta_id;

    // Sécurité : empêcher de modifier un autre compte
    if (req.account.id !== idUser) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const existingOpinion = await Opinion.findOne({
      opi_eta_id: idEstab,
      opi_uti_id: idUser,
    });
    if (existingOpinion) {
      return res.status(400).json({
        message:
          "Il existe déjà un avis de cet utilisateur pour cet établissement.",
      });
    }

    const opinion = await Opinion.create({
      opi_eta_id: idEstab,
      opi_uti_id: idUser,
      opi_com: req.body.opi_com,
      opi_note: req.body.opi_note,
    });

    res.status(201).json({
      message: "Avis créé avec succès.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de la création de l'avis." + err.message,
    });
  }
};

exports.updateUserOpinion = async (req, res) => {
  try {
    idUser = req.params.id;
    estabId = req.body.opi_eta_id;
    // Sécurité : empêcher de modifier un autre compte
    if (req.account.id !== idUser) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const allowedUpdateFields = {
      opi_com: req.body.opi_com,
      opi_note: req.body.opi_note,
    };
    const opinion = await Opinion.findOneAndUpdate(
      { opi_uti_id: idUser, opi_eta_id: estabId },
      allowedUpdateFields,
      { new: true },
    );
    res.status(200).json({
      message: "Avis mis à jour avec succès.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur serveur lors de la modification de l'avis. ",
    });
  }
};

exports.deleteUserOpinion = async (req, res) => {
  try {
    idUser = req.params.id;
    // Sécurité : empêcher de modifier un autre compte
    if (req.account.id !== idUser) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const opinionId = req.params.idOpi;
    const opinion = await Opinion.findByIdAndDelete(opinionId);
    if (!opinion) {
      return res.status(404).json({ message: "Opinion non trouvée" });
    }
    res.status(200).json({
      message: "Avis supprimé avec succès.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression de l'avis. ",
    });
  }
};
