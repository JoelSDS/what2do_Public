const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  cat_name: { type: String, maxlength: 100, required: true },
  cat_code: { type: String, maxlength: 100, required: true },
});

categorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Category", categorySchema, "categories");
