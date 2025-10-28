// DEPRECATED: Legacy dives route. The project now exposes /api/entries and
// uses entryController.js. This file has been moved to deprecated/ for
// retention and can be removed after confirming it's no longer referenced.

const express = require("express");
const router = express.Router();
const {
  getDiveSites,
  getDiveSite,
  createDiveSite,
  updateDiveSite,
  deleteDiveSite,
} = require("../controllers/diveController");

router.route("/").get(getDiveSites).post(createDiveSite);
router
  .route("/:id")
  .get(getDiveSite)
  .put(updateDiveSite)
  .delete(deleteDiveSite);

module.exports = router;
