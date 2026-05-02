const mongoose = require("mongoose");

const nomineeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  linkedin: {
    type: String,
    default: "",
  },
  twitter: {
    type: String,
    default: "",
  },
  github: {
    type: String,
    default: "",
  },
  medium: {
    type: String,
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Nominee", nomineeSchema);
