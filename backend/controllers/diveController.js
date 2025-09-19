const DiveSite = require("../models/DiveSite");
const { geocodeLocation } = require("../utils/geocoder");

// @desc    Get all dive sites
// @route   GET /api/dives
// @access  Public
exports.getDiveSites = async (req, res) => {
  try {
    const diveSites = await DiveSite.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: diveSites.length,
      data: diveSites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single dive site
// @route   GET /api/dives/:id
// @access  Public
exports.getDiveSite = async (req, res) => {
  try {
    const diveSite = await DiveSite.findById(req.params.id);

    if (!diveSite) {
      return res.status(404).json({
        success: false,
        error: "Dive site not found",
      });
    }

    res.status(200).json({
      success: true,
      data: diveSite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create a dive site
// @route   POST /api/dives
// @access  Public
exports.createDiveSite = async (req, res) => {
  try {
    const { place, country } = req.body;

    // Compose a query for geocoding using place and country
    const q = place && country ? `${place}, ${country}` : place || country || null;
    if (q) {
      const coordinates = await geocodeLocation(q);
      req.body.latitude = coordinates.latitude;
      req.body.longitude = coordinates.longitude;
    }

    const diveSite = await DiveSite.create(req.body);

    res.status(201).json({
      success: true,
      data: diveSite,
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

// @desc    Update dive site
// @route   PUT /api/dives/:id
// @access  Public
exports.updateDiveSite = async (req, res) => {
  try {
    const { place, country } = req.body;

    const q = place && country ? `${place}, ${country}` : place || country || null;
    if (q) {
      const coordinates = await geocodeLocation(q);
      req.body.latitude = coordinates.latitude;
      req.body.longitude = coordinates.longitude;
    }

    const diveSite = await DiveSite.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!diveSite) {
      return res.status(404).json({
        success: false,
        error: "Dive site not found",
      });
    }

    res.status(200).json({
      success: true,
      data: diveSite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete dive site
// @route   DELETE /api/dives/:id
// @access  Public
exports.deleteDiveSite = async (req, res) => {
  try {
    const diveSite = await DiveSite.findById(req.params.id);

    if (!diveSite) {
      return res.status(404).json({
        success: false,
        error: "Dive site not found",
      });
    }

    await diveSite.deleteOne();

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
