const Establishment = require("../models/establishment.model.js");
const bcrypt = require("bcrypt");
const uploadImage = require("../utils/uploadImage");
const fs = require("fs");
const path = require("path");
const EmailToken = require("../models/emailToken.model");
const { generateEmailToken } = require("../utils/tokenTemp"); // le fichier ci-dessus
const sendEmail = require("../utils/sendEmail");

exports.findAll = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    // Recherche texte
    const searchValue = req.query.searchValue || "";
    const searchRegex = new RegExp(searchValue, "i");

    // Filtrage catégorie
    const categoryId = req.query.categoryId;

    // Construction du filtre MongoDB
    let filter = { eta_isActive: true, eta_isValidated: true };
    if (searchValue) {
      filter.eta_name = { $regex: searchRegex };
    }
    if (categoryId) {
      filter.eta_cat_id = categoryId;
    }
    // Requête avec pagination
    const establishments = await Establishment.find(
      filter,
      "id eta_name eta_mail eta_photos eta_address eta_description eta_opening_hours eta_tel eta_cat_id eta_date_creation eta_logo",
    )
      .skip(skip)
      .limit(limit);

    res.json(establishments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.findById = async (req, res) => {
  try {
    const establishment = await Establishment.findOne(
      { _id: req.params.id, eta_isActive: true, eta_isValidated: true },
      "id eta_name eta_mail eta_photos eta_address eta_description eta_opening_hours eta_tel eta_cat_id eta_date_creation eta_logo",
    );
    if (!establishment) {
      return res.status(404).json({ message: "Établissement non trouvé" });
    }
    res.json(establishment);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

//Création du profil simplifier name mail et password
exports.create = async (req, res) => {
  try {
    const newEstablishment = req.body.establishment;
    const existingEstablishment = await Establishment.findOne({
      eta_mail: newEstablishment.eta_mail,
    });
    if (existingEstablishment) {
      res.status(400).json({ message: "Cet email est déjà utilisé. " });
    }
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(newEstablishment.eta_password, 10);

    const establishment = await Establishment.create({
      eta_name: newEstablishment.eta_name,
      eta_mail: newEstablishment.eta_mail,
      eta_password: hashedPassword,
      eta_cat_id: newEstablishment.eta_cat_id,
      eta_isValidated: false,
    });

    // 2. Générer le token
    const token = generateEmailToken();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    await EmailToken.create({
      ownerId: establishment._id,
      accountType: "Establishment",
      token,
      expiresAt,
    });

    // 3. Créer le lien de validation
    const link = `http://localhost:3000/api/verify-email?token=${token}`;

    const previewLink = await sendEmail(
      establishment.eta_mail,
      "Confirmation de votre adresse email",
      `<p>Bonjour ${establishment.eta_name},</p>
      <p>Merci de vous être inscrit sur notre plateforme. Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous dans les 48 heures :</p>
      <p><a href="${link}">Confirmer mon adresse</a></p>
      <p>Si vous ne confirmez pas dans ce délai, votre compte sera automatiquement supprimé.</p>
      <p>Merci et à bientôt,<br>L’équipe de What2Do 👋</p>`,
    );
    console.log("voir l'email : ", previewLink);

    res.status(201).json({
      message: "Établissement créé avec succès.",
      establishmentId: establishment._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.update = async (req, res) => {
  try {
    const estabId = req.params.id;

    // Sécurité : empêcher de modifier un autre compte
    if (req.account.id !== estabId) {
      return res.status(403).json({ message: "Accès interdit." });
    }

    const folderName = "establishmentImages";
    const lstImages = req.body.eta_photos;
    let lstImagesUrl = [];

    // Gestion des photos
    if (!lstImages || lstImages.length === 0) {
      const imageFolderPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "EstablishmentImages",
        estabId,
      );
      fs.rm(imageFolderPath, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error(
            `Erreur lors de la suppression du dossier : ${imageFolderPath}`,
            err,
          );
        } else {
        }
      });
    } else {
      const existingEstab = await Establishment.findById(estabId);
      const existingPhotos = existingEstab.eta_photos;
      const photosToDelete = existingPhotos.filter(
        (photo) => !lstImages.includes(photo),
      );
      lstImagesUrl = existingPhotos.filter((photo) =>
        lstImages.includes(photo),
      );

      // Suppression des photos qui ne sont plus dans la nouvelle liste
      photosToDelete.forEach((photo) => {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "public/",
          photo.replace(/^.*\/establishmentImages\//, "establishmentImages/"),
        );
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(
              `Erreur lors de la suppression de l'image : ${photo}`,
              err,
            );
          } else {
          }
        });
      });
    }

    // Enregistrement des nouvelles images base64
    for (const image of lstImages) {
      const base64Image = image;
      if (base64Image) {
        const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const imageUrl = await uploadImage(
            base64Image,
            estabId,
            folderName,
            false,
            req.headers.host,
          );
          lstImagesUrl.push(imageUrl);
        }
      }
    }

    // --- Gestion du logo unique ---
    // --- Gestion du logo unique ---
    let logoUrl = null;
    const etaLogo = req.body.eta_logo;

    // Récupérer l'ancien logo pour pouvoir le supprimer si besoin
    const existingEstab = await Establishment.findById(estabId);
    if (etaLogo) {
      const matches = etaLogo.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1];

        // Chemin de l'ancien logo (nom fixe) à supprimer
        if (existingEstab.eta_logo) {
          const oldLogoPath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            existingEstab.eta_logo.replace(
              /^.*\/establishmentImages\//,
              "establishmentImages/",
            ),
          );
          fs.unlink(oldLogoPath, (err) => {
            if (err) console.warn("Ancien logo introuvable ou déjà supprimé");
            else console.log("Ancien logo supprimé:", oldLogoPath);
          });
        }

        // Upload du nouveau (nom fixe)
        logoUrl = await uploadImage(
          etaLogo,
          estabId,
          folderName,
          false,
          req.headers.host,
          `logo.${ext}`,
        );
      } else if (typeof etaLogo === "string" && etaLogo.startsWith("http")) {
        logoUrl = etaLogo; // conserver l'ancien
      }
    }

    // Champs autorisés pour la mise à jour
    const allowedUpdateFields = {
      eta_name: req.body.eta_name,
      eta_description: req.body.eta_description,
      eta_address: req.body.eta_address,
      eta_tel: req.body.eta_tel,
      eta_photos: lstImagesUrl,
      eta_opening_hours: req.body.eta_opening_hours,
      eta_cat_id: req.body.eta_cat_id,
      eta_logo: logoUrl, // ajout du logo
    };

    const updateEstablishment = await Establishment.findByIdAndUpdate(
      estabId,
      allowedUpdateFields,
      { new: true },
    );

    res.status(200).json({
      message: "Établissement mis à jour avec succès.",
      data: updateEstablishment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message:
        "Erreur serveur lors de la modification de l'établissement. " +
        err.message,
    });
  }
};

//Voir pour changer le mot de passe

exports.delete = async (req, res) => {
  try {
    const estabId = req.params.id;
    // Sécurité : empêcher de supprimer un autre compte
    //req.account est créer lorsqu'on rendre dans le middleware isAuthenticated cela créer une propriété account qui contient les données du token
    if (req.account.id !== estabId) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const establishment = await Establishment.findByIdAndUpdate(
      estabId,
      { eta_isActive: false },
      { new: true },
    );
    res.status(200).json({
      message: "Établissement supprimé avec succès.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression de l'établissement. ",
    });
  }
};
