"use strict";

const USER = require("../user.model");

/**
 * @desc: create a new user
 * @param {*} param
 */
const createUser = async ({
  usr_id,
  usr_name,
  usr_slug,
  usr_password,
  usr_role,
}) => {
  const user = await USER.create({
    usr_id,
    usr_name,
    usr_slug,
    usr_password,
    usr_role,
  });

  return user;
};

module.exports = {
  createUser,
};
