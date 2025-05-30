"use strict";

const crypto = require("crypto");
const OTP = require("../models/otp.model");

const generatorTokenRandom = () => {
  const token = crypto.randomInt(0, Math.pow(2, 32));
  return token;
};

const newOtp = async ({ email }) => {
  const token = generatorTokenRandom();
  const newToken = await OTP.create({
    otp_token: token,
    otp_email: email,
  });

  return newToken;
};

const checkEmailToken = async ({ token }) => {
  // Check token in model otp
  const hasToken = await OTP.findOne({
    otp_token: token,
  });

  if (!hasToken) throw new Error("Token not found");

  // Delete
  OTP.deleteOne({ otp_token: hasToken }).then();

  return token;
};

module.exports = {
  newOtp,
  checkEmailToken
};
