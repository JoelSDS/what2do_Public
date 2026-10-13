//Token Temporaire pour l'envoi du mail
const mongoose = require("mongoose");

const emailTokenSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "accountType",
    },
    accountType: {
      type: String,
      required: true,
      enum: ["User", "Establishment"],
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

emailTokenSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("EmailToken", emailTokenSchema, "emailTokens");
