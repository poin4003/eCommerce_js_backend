'use strict'

const { BadRequestError } = require("../core/error.response");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {

  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get token success!',
      metadata: await AccessService.handlerRefreshToken( req.body.refreshToken )
    }).send(res)
  }

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body)
    }).send(res)
  }

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logout success!',
      metadata: await AccessService.logout(req.keyStore)
    }).send(res)
  }

  signUp = async (req, res, next) => {
    new CREATED({
      message: 'Registed OK!',
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      }
    }).send(res)
  }
}

module.exports = new AccessController()