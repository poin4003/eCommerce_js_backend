'use strict'

const CartService = require('../services/cart.service')
const { SuccessResponse } = require('../core/success.response')

class CartController {

  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Cart successful!',
      metadata: await CartService.addToCart( req.body )
    }).send(res)
  }

  update = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update cart successful!',
      metadata: await CartService.addToCartV2( req.body )
    }).send(res)
  }

  delete = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete cart successful!',
      metadata: await CartService.deleteUserCart( req.body )
    }).send(res)
  }

  listToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'List Cart successful!',
      metadata: await CartService.getListCart( req.query )
    }).send(res)
  }
}

module.exports = new CartController()