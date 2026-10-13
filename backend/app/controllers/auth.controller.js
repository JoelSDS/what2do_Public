const EmailToken = require("../models/emailToken.model");
const User = require("../models/user.model");
const Establishment = require("../models/establishment.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

exports.verifyEmailToken = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({ message: "Token manquant." });
    }

    const emailToken = await EmailToken.findOne({ token });
    console.log("email Token :", emailToken);

    if (!emailToken) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    // Vérifie l’expiration
    if (emailToken.expiresAt < Date.now()) {
      if (emailToken.accountType === "User") {
        await User.findByIdAndDelete(emailToken.ownerId);
      } else if (emailToken.accountType === "Establishment") {
        await Establishment.findByIdAndDelete(emailToken.ownerId);
      }

      await EmailToken.deleteOne({ _id: emailToken._id });

      return res
        .status(400)
        .json({ message: "Lien expiré. Votre compte a été supprimé." });
    }

    // Détermine le type de compte
    if (emailToken.accountType === "User") {
      await User.findByIdAndUpdate(
        emailToken.ownerId,
        {
          uti_isValidated: true,
        },
        { new: true },
      );
    } else if (emailToken.accountType === "Establishment") {
      await Establishment.findByIdAndUpdate(
        emailToken.ownerId,
        {
          eta_isValidated: true,
        },
        { new: true },
      );
    }

    // Supprime le token
    await EmailToken.deleteOne({ _id: emailToken._id });

    return res
      .status(200)
      .json({ message: "Votre adresse e-mail a été confirmée avec succès !" });
  } catch (error) {
    console.error("Erreur de vérification :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.login = async (req, res) => {
  const { email, password, accountType } = req.body;

  try {
    // 1. Vérification des champs
    if (!email || !password || !accountType) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    if (!["User", "Establishment"].includes(accountType)) {
      return res.status(400).json({ message: "Type de compte invalide." });
    }

    // 2. Récupération du modèle selon le type de compte
    const Model = accountType === "User" ? User : Establishment;

    // 3. Recherche du compte
    const account = await Model.findOne({
      [`${accountType === "User" ? "uti_mail" : "eta_mail"}`]: email,
    });

    if (!account) {
      return res.status(404).json({ message: "Compte introuvable." });
    }

    // 4. Vérification du mot de passe
    const isMatch = await bcrypt.compare(
      password,
      account[accountType === "User" ? "uti_password" : "eta_password"],
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    // 5. Vérification de la validation email
    const isValidated =
      account[accountType === "User" ? "uti_isValidated" : "eta_isValidated"];

    if (!isValidated) {
      return res.status(403).json({
        message: "Veuillez d'abord valider votre adresse email.",
      });
    }

    // 6. Génération du JWT token
    const tokenPayload = {
      id: account._id,
      accountType,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LOGIN_EXPIRES_IN,
    });

    // 7. Réponse
    res.status(200).json({
      message: "Connexion réussie",
      token,
      account: {
        id: account._id,
        name:
          accountType === "User"
            ? `${account.uti_name} ${account.uti_surname}`
            : account.eta_name,
        email: email,
        accountType,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de la connexion.",
      error: error.message,
    });
  }
};

//IL FAUT TESTER MAIS LE LINK DOIS RENVOYER VERS UNE PAGE DU FRONT QUI PERMET DE DEFINIR LE NOUVEAU MDP ET ENSUITE FAIRE APPEL A
//RESETPASSWORD AVEC LE TOKEN ENVOYE DANS LE LIEN (DANS LE FRONT FAUT LE RECUP) ET FAIRE RESET PASSWORD AVEC LE NOUVEAU MDP ET LE TOKEN
exports.forgotPassword = async (req, res) => {
  const { email, accountType } = req.body;

  try {
    // 1. Choix du modèle et recherche par email adapté
    const Model = accountType === "User" ? User : Establishment;

    const emailField = accountType === "User" ? "uti_mail" : "eta_mail";

    const account = await Model.findOne({ [emailField]: email });
    if (!account) {
      return res.status(404).json({ message: "Compte non trouvé" });
    }

    // 2. Génération du token JWT (validité 1h)
    const resetToken = jwt.sign(
      { id: account._id, accountType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Etant donné qu'on a déjà l'objet en mémoire cette facons est la plus simple
    //sinon utiliser la méthode update
    account.resetPasswordToken = resetToken;
    account.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await account.save();

    //METTRE LE LIEN QUI IRA SUR LA PAGE DE MODIFICATION DU MDP !!
    const link = `http://localhost:8100/tabs/reset-password/${resetToken}`;
    const name = accountType === "User" ? "uti_name" : "eta_name";

    // 4. Envoi du mail avec le lien de réinitialisation
    const previewLink = await sendEmail(
      email,
      "Réinitialisation de votre mot de passe",
      `<p>Bonjour ${account[name]},</p>
      <p>Nous avons bien reçu une demande de réinitialisation de votre mot de passe. Pour continuer, veuillez cliquer sur le lien ci-dessous dans l'heure qui suit :</p>
      <p><a href="${link}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      <p>Merci,<br>L’équipe de What2Do 👋</p>`,
    );

    console.log("lien pour le mail :", link);

    res.json({ message: "Email de réinitialisation envoyé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.passwordReset = async (req, res) => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Trouver l’utilisateur avec ce token valide
    const Model = decoded.accountType === "User" ? User : Establishment;
    const account = await Model.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!account) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    // Hasher et mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const passwordField =
      decoded.accountType === "User" ? "uti_password" : "eta_password";
    account[passwordField] = hashedPassword;
    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;

    await account.save();

    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    res.status(400).json({ message: "Token invalide ou expiré" });
  }
};
