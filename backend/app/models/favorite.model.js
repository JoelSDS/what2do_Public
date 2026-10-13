const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  fav_date_of_add: { type: Date, default: Date.now },
  fav_uti_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fav_eta_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Establishment",
    required: true,
  },
});

favoriteSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Favorite", favoriteSchema, "favorites");
