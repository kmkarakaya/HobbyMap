const mongoose = require("mongoose");

const diveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title for the entry"],
      trim: true,
    },
    hobby: {
      type: String,
      required: [true, "Please enter the hobby or activity name"],
      trim: true,
    },
    place: {
      type: String,
      required: [true, "Please enter a place (city/town/site)"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Please enter a country"],
      trim: true,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    date: {
      type: Date,
      required: [true, "Please enter the date of the entry"],
    },
    notes: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DiveSite", diveSchema);
