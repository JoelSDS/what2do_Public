require("dotenv").config(); // Charge le fichier .env dans process.env
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt"); // Importation de bcrypt pour le hachage des mots de passe
const db = require("./app/config/db.config.js"); // Chemin vers le fichier de configuration de la base de données
const path = require("path"); //Rajout de cela pour gérer les chemins de fichiers

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // autorise les requêtes cross-origin venant de l'app mobile
app.use(express.json({ limit: "50mb" })); // parse les JSON venant du frontend
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
// Connect to MongoDB
db.mongoose
  .connect(db.url, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Donne accès aux fichiers statiques et cela montes le dossier public à la racine / de ton serveur.
// du coup pour accéder à public pas besoin de mettre /public dans l'url
app.use("/public", express.static(path.join(__dirname, "public")));

// METTRE LES ACCES AUX ROUTES ICI
const authRoutes = require("./app/routes/auth.routes");
const userRoutes = require("./app/routes/user.routes");
const categoryRoutes = require("./app/routes/category.routes");
const favoriteRoutes = require("./app/routes/favorite.routes");
const establishmentRoutes = require("./app/routes/establishment.routes");
const opinionRoutes = require("./app/routes/opinion.routes");
const eventRoutes = require("./app/routes/event.routes.js");

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", establishmentRoutes);
app.use("/api", opinionRoutes);
app.use("/api", eventRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
