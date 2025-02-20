'use strict'

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const shopModel = require('../models/shop.model')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail } = require('./shop.service')

const RoleShop = {
  SHOP: 'SHOP',
  WRITTER: 'WRITTER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {

  static handlerRefreshToken = async(refreshToken) => {
    // 1. Check token used
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
    if (foundToken) {
      // Decode to find out who's access
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
      console.log({ userId, email });
      
      // Delete key store
      await KeyTokenService.deletKeyByUserId(userId)
      throw new ForbiddenError('Something wrong happend !! please relogin')
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if (!holderToken) throw new AuthFailureError('Shop not registered')

    const { userId, email } = await verifyJWT( refreshToken, holderToken.privateKey )

    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new AuthFailureError('Shop not registered')

    // Create new token pair
    const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

    // Update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken
      }
    })

    return {
      user: {userId, email},
      tokens
    }
  }

  static logout = async(keyStore) => {
    return await KeyTokenService.removeKeyById(keyStore._id)
  }

  static login = async({ email, password, refreshToken = null }) => {
    // 1. Check email exist
    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new BadRequestError('Shop not registered')

    // 2. Match password
    const match = bcrypt.compare( password, foundShop.password )
    if (!match) throw new AuthFailureError('Authentication error')

    // 3. Create accessToken and refreshToken and save
    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')

    const { _id: userId } = foundShop._id

    const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      userId,
      publicKey, privateKey,
      refreshToken: tokens.refreshToken,
    })

    // 4. Get data return login
    return {
      shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
      tokens
    } 
  }

  static signUp = async ({ name, email, password }) => {
    // 1. Check email exits
    const holderShop = await shopModel.findOne({ email }).lean()

    if (holderShop) {
      throw new BadRequestError('Error: Shop already registered!')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newShop = await shopModel.create({
      name, 
      email, 
      password: passwordHash, 
      roles: [RoleShop.SHOP]
    })

    if (newShop) {
      // Create privateKey and publicKey
      // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: 'pkcs1',
      //     format: 'pem'
      //   },
      //   privateKeyEncoding: {
      //     type: 'pkcs1',
      //     format: 'pem'
      //   }
      // })

      const privateKey = crypto.randomBytes(64).toString('hex')
      const publicKey = crypto.randomBytes(64).toString('hex')

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey
      })

      if (!keyStore) {
        return {
          //throw new BadRequestError('Error: Shop already registered!')
          code: 'xxxx',
          message: 'keyStore error'
        }
      }

      // Create token pair
      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
      console.log(`Created Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
          tokens
        }
      }
    }

    return {
      code: 201,
      metadata: null
    }
  }
}

module.exports = AccessService