"use strict";

const USER = require("../models/user.model");
const { SuccessResponse } = require("../core/success.response");
const { ErrorResponse } = require("../core/error.response");
const { sendEmailToken } = require("./email.service");

const newUserService = async (email = null, captcha = null) => {
  // 1. Check email exists in dbs
  const user = await USER.findOne({ email }).lean();

  // 2. If exists
  if (user) {
    return ErrorResponse({
      message: "Email already exists",
    });
  }

  // 3. Send token via email user
  const result = await sendEmailToken({
    email,
  });

  return {
    message: "Verify email user",
    metadata: {
      token: result,
    },
  };
};

module.exports = {
  newUserService,
};
