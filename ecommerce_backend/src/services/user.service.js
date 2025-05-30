"use strict";

const USER = require("../models/user.model");
const { ErrorResponse } = require("../core/error.response");
const { sendEmailToken } = require("./email.service");
const { checkEmailToken } = require("./otp.service");
const bcrypt = require('bcrypt');
const { createUser } = require("../models/repositories/user.repo");
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

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

const checkLoginEmailTokenService = async () => {
  try {
    // 1. Check token in mode otp
    const { otp_email: email, otp_token } = await checkEmailToken({ token });
    if (!email) throw new ErrorResponse(`Token not found`);

    // 2. Check email exists in user model
    const hasUser = await findUserByEmailWithLogin({
      email,
    });

    if (hasUser) throw new ErrorResponse(`Email already exists`);

    // new User
    const passwordHash = await bcrypt.hash(email, 10);

    const newUser = await createUser({
      usr_id: 1,
      usr_slug: "xyzjdslkfjd" ,
      usr_name: email,
      usr_password: passwordHash,
      usr_role: "",
    });

    if (newUser) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newUser.usr_id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        return {
          //throw new BadRequestError('Error: Shop already registered!')
          code: "xxxx",
          message: "keyStore error",
        };
      }

      // Create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      return {
        code: 201,
        message: "verify successfully",
        metadata: {
          user: getInfoData({ filed: ['usr_id', 'usr_name', 'usr_email'], object: newUser }),
          tokens
        }
      }
    }
  } catch (error) {}
};

const findUserByEmailWithLogin = async (email) => {
  const user = await USER.findOne({ usr_email: email }).lean();

  return user;
};

module.exports = {
  newUserService,
  checkLoginEmailTokenService,
};
