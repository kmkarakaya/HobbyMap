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
