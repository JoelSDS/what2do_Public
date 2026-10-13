const mongoose = require("mongoose");

const opinionSchema = new mongoose.Schema({
  opi_note: { type: Number, min: 0, max: 5 },
  opi_com: { type: String },
  opi_date: { type: Date, default: Date.now },
  opi_uti_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  opi_eta_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Establishment",
    required: true,
  },
});

opinionSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Opinion", opinionSchema, "opinions");
