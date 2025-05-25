"use strict";

const express = require("express");
const {
  newResource,
  newRole,
  listRoles,
  listResources
} = require("../../controllers/rbac.controller");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

router.post("/role", asyncHandler(newRole));
router.get("/roles", asyncHandler(listRoles));

router.post("/resource", asyncHandler(newResource));
router.get("/resources", asyncHandler(listResources));

module.exports = router;