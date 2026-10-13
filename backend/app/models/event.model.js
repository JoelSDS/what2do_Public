const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eve_nom: { type: String, maxlength: 255, required: true },
  eve_eta_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Establishment",
    required: true,
  },
  eve_cat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  eve_images: [{ type: String }],
  eve_description: { type: String },
  eve_date_debut: { type: Date, required: true },
  eve_date_fin: { type: Date, required: true },
  eve_isActive: { type: Boolean, default: true },
});

// Pour un format JSON propre (supprime __v et renomme _id en id)
eventSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Event", eventSchema, "events");
