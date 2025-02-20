'use strict'

const keytokenModel = require("../models/keytoken.model")

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      const filter = { user: userId }, update = {
        publicKey, privateKey, refreshTokensUsed: [], refreshToken
      }, options = { upsert: true, new: true }

      const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)  

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  static removeKeyById = async ( id ) => {
    return await keytokenModel.deleteOne(id)
  }

  static findByUserId = async ( userId ) => {
    return await keytokenModel.findOne({ user: userId}).lean()
  }

  static findByRefreshTokenUsed = async( refreshToken ) => {
    return await keytokenModel.findOne({ refreshTokensUsed: refreshToken }).lean()
  }

  static findByRefreshToken = async( refreshToken ) => {
    return await keytokenModel.findOne({ refreshToken })
  }

  static deletKeyByUserId = async (userId) => {
    return await keytokenModel.deleteOne({ user: userId })
  }
}

module.exports = KeyTokenService