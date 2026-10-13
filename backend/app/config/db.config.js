const mongoose = require("mongoose");
//si On change sur url docker mettre les ports a 3333 sinon en local 3000
// et du coups vérifier le port qu'on met dans le link dans controller User et Estab
module.exports = {
  mongoose,
  //url docker
  //url: process.env.MONGO_URL,
  //url local
  url: process.env.MONGO_URL_LOCAL,
};
