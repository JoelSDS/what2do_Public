const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const uploadImage = require("../utils/uploadImage");
const EmailToken = require("../models/emailToken.model");
const { generateEmailToken } = require("../utils/tokenTemp"); // le fichier ci-dessus
const sendEmail = require("../utils/sendEmail");

//Filtrer les champs sensibles avant de renvoyer l'utilisateur
exports.findAll = async (req, res) => {
  try {
    const users = await User.find(
      { uti_isActive: true, uti_isValidated: true },
      "id uti_name uti_surname uti_mail uti_image uti_date_creation",
    );
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.findById = async (req, res) => {
  try {
    const user = await User.findOne(
      { _id: req.params.id, uti_isActive: true, uti_isValidated: true },
      "id uti_name uti_surname uti_mail uti_image uti_date_creation",
    );
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

exports.create = async (req, res) => {
  try {
    const newUser = req.body.user;
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ uti_mail: newUser.uti_mail });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(newUser.uti_password, 10);

    // Création de l'utilisateur
    const user = await User.create({
      uti_name: newUser.uti_name,
      uti_surname: newUser.uti_surname,
      uti_mail: newUser.uti_mail,
      uti_password: hashedPassword,
      uti_image:
        "http://localhost:3000/public/usersImage/defaultProfileImage.jpg", // Chemin par défaut pour l'image
      uti_isValidated: false,
    });

    // 2. Générer le token
    const token = generateEmailToken();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    await EmailToken.create({
      ownerId: user._id,
      accountType: "User",
      token,
      expiresAt,
    });

    // 3. Créer le lien de validation et l'envoi du mail
    const link = `http://localhost:3000/api/verify-email?token=${token}`;

    const previewLink = await sendEmail(
      user.uti_mail,
      "Confirmation de votre adresse email",
      `<p>Bonjour ${user.uti_name},</p>
      <p>Merci de vous être inscrit sur notre plateforme. Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous dans les 48 heures :</p>
      <p><a href="${link}">Confirmer mon adresse</a></p>
      <p>Si vous ne confirmez pas dans ce délai, votre compte sera automatiquement supprimé.</p>
      <p>Merci et à bientôt,<br>L’équipe de What2Do 👋</p>`,
    );
    console.log("voir l'email : ", previewLink);

    res.status(201).json({
      message: "Utilisateur créé avec succès. Veuillez valider votre e-mail.",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Erreur serveur lors de la création de l’utilisateur." + err.message,
    });
  }
};

//on part du principe que id uti_name uti_surname uti_image sont envoyés dans le body
// faire sans doute comme create req.body.user
exports.update = async (req, res) => {
  try {
    const userId = req.params.id;
    const folderName = "usersImages";
    const base64Image = req.body.uti_image;

    // Sécurité : empêcher de modifier un autre compte
    //req.account est créer lorsqu'on rendre dans le middleware isAuthenticated cela créer une propriété account qui contient les données du token
    if (req.account.id !== userId) {
      return res.status(403).json({ message: "Accès interdit." });
    }

    let imageUrl = ""; //A REVOIR CELA !!!!! PEUT ETRE METTRE DEFAULT
    if (base64Image) {
      //test si l'image est une base64
      const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        //faire l'enregistrement de l'image
        imageUrl = await uploadImage(
          base64Image,
          userId,
          folderName,
          true,
          req.headers.host,
        );
      }
    }

    //mettre les champs autorisés pour la mise à jour
    const allowedUpdateFields = {
      uti_name: req.body.uti_name,
      uti_surname: req.body.uti_surname,
      uti_image: imageUrl,
    };

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      allowedUpdateFields,
      { new: true },
    );
    res.status(200).json({
      message: "Utilisateur mis à jour avec succès.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur serveur lors de la modification de l’utilisateur. ",
    });
  }
};

///Voir pour faire une methode pour changer le password

exports.delete = async (req, res) => {
  try {
    const userId = req.params.id;
    // Sécurité : empêcher de supprimer un autre compte
    //req.account est créer lorsqu'on rendre dans le middleware isAuthenticated cela créer une propriété account qui contient les données du token
    if (req.account.id !== userId) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { uti_isActive: false },
      { new: true },
    );
    res.status(200).json({
      message: "Utilisateur supprimé avec succès.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression de l'utilisateur. ",
    });
  }
};
