"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  newUser,
  checkLoginEmailToken,
} = require("../../controllers/user.controller");

router.post("/new_user", asyncHandler(newUser));
router.get("/welcome-back", asyncHandler(checkLoginEmailToken));

module.exports = router;
