// controllers/event.controller.js
const Event = require("../models/event.model");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const uploadImage = require("../utils/uploadImage");
const fs = require("fs");
const path = require("path");

///GROS PROBLEME A CAUSE DE CATEGORYID DONC C'EST LA SEULE METHODE QUE J'AI TROUVER
exports.findAll = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    // Recherche texte
    const searchValue = req.query.searchValue || "";
    const searchRegex = new RegExp(searchValue, "i");

    // Filtrage catégorie (string depuis la query)
    const categoryId = req.query.categoryId;

    const pipeline = [
      // 1) Base: actif + recherche
      {
        $match: {
          eve_isActive: true,
          ...(searchValue ? { eve_nom: { $regex: searchRegex } } : {}),
        },
      },

      // 2) Coercition & filtre date fin >= maintenant
      { $addFields: { _endDate: { $toDate: "$eve_date_fin" } } },
      { $match: { _endDate: { $gte: new Date() } } },

      // 3) Filtre catégorie optionnel (tolère ObjectId ou string en base)
      ...(categoryId
        ? [
            {
              $match: {
                $expr: {
                  $or: [
                    // cas champ = ObjectId
                    { $eq: ["$eve_cat_id", new ObjectId(categoryId)] },
                    // cas champ = string
                    { $eq: [{ $toString: "$eve_cat_id" }, categoryId] },
                  ],
                },
              },
            },
          ]
        : []),

      // 4) Tri, pagination
      { $sort: { eve_date_debut: 1 } },
      { $skip: skip },
      { $limit: limit },

      // 5) Populate établissement
      {
        $addFields: {
          eve_eta_id_obj: { $toObjectId: "$eve_eta_id" },
        },
      },
      {
        $lookup: {
          from: "establishments",
          localField: "eve_eta_id_obj",
          foreignField: "_id",
          as: "establishment",
        },
      },
      { $unwind: { path: "$establishment", preserveNullAndEmptyArrays: true } },

      // 6) Projection finale
      {
        $project: {
          id: "$_id",
          _id: 0,
          eve_nom: 1,
          eve_cat_id: 1,
          eve_images: 1,
          eve_description: 1,
          eve_date_debut: 1,
          eve_date_fin: 1,
          eve_eta_id: {
            eta_name: "$establishment.eta_name",
            eta_logo: "$establishment.eta_logo",
            eta_address: "$establishment.eta_address",
          },
        },
      },
    ];

    const events = await Event.aggregate(pipeline);
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.findAllEstablishmentEvents = async (req, res) => {
  try {
    const estabId = req.params.establishmentId;

    if (!estabId) {
      return res
        .status(400)
        .json({ message: "establishmentId requis dans l'URL" });
    }

    // Pagination
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    const pipeline = [
      // 1) Filtrer par établissement + actif
      {
        $match: {
          eve_isActive: true,
          $or: [{ eve_eta_id: estabId }, { eve_eta_id: new ObjectId(estabId) }],
        },
      },

      // 2) Filtrer date fin >= maintenant
      { $addFields: { _endDate: { $toDate: "$eve_date_fin" } } },
      { $match: { _endDate: { $gte: new Date() } } },

      // 3) Tri + pagination
      { $sort: { eve_date_debut: 1 } },
      { $skip: skip },
      { $limit: limit },

      // 4) Populate établissement
      {
        $addFields: {
          eve_eta_id_obj: {
            $cond: {
              if: { $eq: [{ $type: "$eve_eta_id" }, "objectId"] },
              then: "$eve_eta_id",
              else: { $toObjectId: "$eve_eta_id" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "establishments",
          localField: "eve_eta_id_obj",
          foreignField: "_id",
          as: "establishment",
        },
      },
      { $unwind: { path: "$establishment", preserveNullAndEmptyArrays: true } },

      // 5) Projection finale
      {
        $project: {
          id: "$_id",
          _id: 0,
          eve_nom: 1,
          eve_cat_id: 1,
          eve_images: 1,
          eve_description: 1,
          eve_date_debut: 1,
          eve_date_fin: 1,
          eve_eta_id: {
            eta_name: "$establishment.eta_name",
            eta_logo: "$establishment.eta_logo",
            eta_address: "$establishment.eta_address",
          },
        },
      },
    ];

    const events = await Event.aggregate(pipeline);
    res.json(events);
  } catch (error) {
    console.error("Erreur lors de la récupération des événements :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.findById = async (req, res) => {
  try {
    const { id } = req.params; // Récupère l'ID depuis l'URL

    // Requête Mongo/Mongoose
    const event = await Event.findById(id).populate(
      "eve_eta_id",
      "eta_name eta_logo eta_address",
    );

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    res.json(event); // Renvoie l'objet trouvé
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.create = async (req, res) => {
  try {
    const folderName = "eventImages";
    const lstImages = req.body.eve_images || [];
    let lstImagesUrl = [];
    const estabId = req.body.eve_eta_id;
    //req.account est créer lorsqu'on rendre dans le middleware isAuthenticated cela créer une propriété account qui contient les données du token
    if (req.account.id !== estabId) {
      return res.status(403).json({ message: "Accès interdit." });
    }

    // Gestion des images envoyées en base64
    for (const image of lstImages) {
      if (image) {
        const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const imageUrl = await uploadImage(
            image,
            "event_" + Date.now(), // dossier unique par événement
            folderName,
            false,
            req.headers.host,
          );
          lstImagesUrl.push(imageUrl);
        }
      }
    }

    const newEvent = await Event.create({
      eve_nom: req.body.eve_nom,
      eve_eta_id: req.body.eve_eta_id,
      eve_cat_id: req.body.eve_cat_id,
      eve_images: lstImagesUrl,
      eve_description: req.body.eve_description,
      eve_date_debut: req.body.eve_date_debut,
      eve_date_fin: req.body.eve_date_fin,
      eve_isActive: true,
    });

    res
      .status(201)
      .json({ message: "Événement créé avec succès", event: newEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message:
        "Erreur serveur lors de la création de l'événement. " + err.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { eventId } = req.params;
    const folderName = "eventImages";
    const lstImages = req.body.eve_images || [];
    let lstImagesUrl = [];

    // Récupérer l'événement existant
    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    // Identifier les images à supprimer
    const photosToDelete = existingEvent.eve_images.filter(
      (photo) => !lstImages.includes(photo),
    );
    lstImagesUrl = existingEvent.eve_images.filter((photo) =>
      lstImages.includes(photo),
    );

    // Supprimer les images retirées
    photosToDelete.forEach((photo) => {
      const imagePath = path.join(
        __dirname,
        "..",
        "..",
        "public/",
        photo.replace(/^.*\/eventImages\//, "eventImages/"),
      );
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Erreur suppression image :", err);
      });
    });

    // Ajouter les nouvelles images base64
    for (const image of lstImages) {
      const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const imageUrl = await uploadImage(
          image,
          eventId,
          folderName,
          false,
          req.headers.host,
        );
        if (!lstImagesUrl.includes(imageUrl)) lstImagesUrl.push(imageUrl);
      }
    }

    // Champs à mettre à jour
    const allowedUpdateFields = {
      eve_nom: req.body.eve_nom,
      eve_eta_id: req.body.eve_eta_id,
      eve_cat_id: req.body.eve_cat_id,
      eve_images: lstImagesUrl,
      eve_description: req.body.eve_description,
      eve_date_debut: req.body.eve_date_debut,
      eve_date_fin: req.body.eve_date_fin,
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      allowedUpdateFields,
      { new: true },
    );

    res.status(200).json({
      message: "Événement mis à jour avec succès",
      event: updatedEvent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message:
        "Erreur serveur lors de la modification de l'événement. " + err.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { eventId } = req.params;

    const deletedEvent = await Event.findByIdAndUpdate(
      eventId,
      { eve_isActive: false },
      { new: true },
    );

    if (!deletedEvent) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    res.json({
      message: "Événement désactivé avec succès",
      event: deletedEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};
