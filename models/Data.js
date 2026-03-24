const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

module.exports = mongoose.model("Data", DataSchema);