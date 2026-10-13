const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  uti_name: { type: String, maxlength: 100, required: true },
  uti_surname: { type: String, maxlength: 100, required: true },
  uti_image: { type: String },
  uti_mail: {
    type: String,
    maxlength: 100,
    unique: true,
    required: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "L'adresse email n'est pas valide",
    ],
    lowercase: true,
  },
  uti_password: { type: String, maxlength: 300, required: true },
  uti_date_creation: { type: Date, default: Date.now },
  uti_isAdmin: { type: Boolean, default: false },
  uti_isActive: { type: Boolean, default: true },
  uti_isValidated: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

schema.method("toJSON", function () {
  const { __v, _id, uti_password, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("User", schema, "users");
