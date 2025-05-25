'use strict';

const express = require('express')
const router = express.Router()
const { asyncHandler } = require("../../auth/checkAuth")
const { authentication } = require("../../auth/authUtils");
const { uploadDisk } = require('../../configs/multer.config');

// router.use(authentication)
router.post('/product/thumb', uploadDisk.single('file'))

module.exports = router