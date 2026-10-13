const mongoose = require("mongoose");

const establishmentSchema = new mongoose.Schema({
  eta_name: { type: String, maxlength: 150, required: true },
  eta_logo: { type: String },
  eta_mail: { type: String, maxlength: 100, required: true },
  eta_password: { type: String, maxlength: 300, required: true },
  eta_description: { type: String },
  eta_address: { type: String, maxlength: 255 },
  eta_tel: { type: String, maxlength: 20 },
  eta_photos: [{ type: String }], // tableau d'URLs (string)
  eta_opening_hours: { type: String },
  eta_date_creation: { type: Date, default: Date.now },
  eta_isActive: { type: Boolean, default: true },

  eta_isValidated: { type: Boolean, default: false },
  eta_cat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

establishmentSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model(
  "Establishment",
  establishmentSchema,
  "establishments"
);
