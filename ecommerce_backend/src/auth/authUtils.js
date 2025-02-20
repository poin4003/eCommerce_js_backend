'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization'
}

const createTokenPair = async ( payload, publicKey, privateKey ) => {
  try {
    // Access Token
    const accessToken = await JWT.sign( payload, publicKey, {
      expiresIn: '2 days'
    })

    const refreshToken = await JWT.sign( payload, privateKey, {
      expiresIn: '7 days'
    })

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    })

    return { accessToken, refreshToken }
  } catch (error) {

  }
}

const authentication = asyncHandler(async (req, res, next) => {
  // 1. Check userId missing
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid requets')

  // 2. Get userId from dbs
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not found key store')

  // 3. Get and verify token
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid request')

  try {
    const decodeUser = JWT.verify( accessToken, keyStore.publicKey )
    // 4. Check keyStore with userId
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId')
    req.keyStore = keyStore
    req.user = decodeUser
    return next()
  } catch (error) {
    throw error
  }
})

const verifyJWT = async(token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT
}