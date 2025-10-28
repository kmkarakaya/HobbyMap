// DEPRECATED: This file was the legacy 'diveController' implementation.
// The project has migrated to 'entry' naming. The canonical controller
// is now in 'backend/controllers/entryController.js'.
// This file has been moved to deprecated/ for retention and can be
// removed after verifying no external references remain.

const Entry = require("../models/Entry");
const { geocodeLocation } = require("../utils/geocoder");

// @desc    Get all entries
// @route   GET /api/entries
// @access  Public
exports.getEntries = async (req, res) => {
  try {
  const entries = await Entry.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single entry
// @route   GET /api/entries/:id
// @access  Public
exports.getEntry = async (req, res) => {
  try {
  const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create an entry
// @route   POST /api/entries
// @access  Public
exports.createEntry = async (req, res) => {
  try {
    const { place, country } = req.body;

    // Compose a query for geocoding using place and country
    const q = place && country ? `${place}, ${country}` : place || country || null;
    if (q) {
      const coordinates = await geocodeLocation(q);
      req.body.latitude = coordinates.latitude;
      req.body.longitude = coordinates.longitude;
    }

  const created = await Entry.create(req.body);

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
};

// @desc    Update entry
// @route   PUT /api/entries/:id
// @access  Public
exports.updateEntry = async (req, res) => {
  try {
    const { place, country } = req.body;

    const q = place && country ? `${place}, ${country}` : place || country || null;
    if (q) {
      const coordinates = await geocodeLocation(q);
      req.body.latitude = coordinates.latitude;
      req.body.longitude = coordinates.longitude;
    }

  const updated = await Entry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Entry not found",
      });
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete entry
// @route   DELETE /api/entries/:id
// @access  Public
exports.deleteEntry = async (req, res) => {
  try {
  const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Entry not found",
      });
    }

    await entry.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
