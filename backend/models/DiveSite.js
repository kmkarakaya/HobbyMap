const mongoose = require("mongoose");

const diveSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: [true, "Please enter a dive site name"],
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
      required: [true, "Please enter the date of your dive"],
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
