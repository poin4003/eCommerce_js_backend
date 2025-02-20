'use strict'

const {
  BadRequestError,
  NotFoundError
} = require('../core/error.response')

const { cart } = require("../models/cart.model")
const { 
  createUserCart,
  updateUserCartQuantity
} = require('../models/repositories/cart.repo')
const { 
  getProductById 
} = require('../models/repositories/product.repo')

/*
  Key features: Cart Service
  - add product to cart [user]
  - reduce product quantity by one [user]
  - increase product quantity by one [user]
  - get cart [user]
  - delete cart [user]
  - delete cart item [user]
*/

class CartService {

  // Add product to cart
  static async addToCart({ userId, product = {} }) {
    // Check cart exits
    const userCart = await cart.findOne({ cart_userId: userId })
    if (!userCart) {
      // Create cart for user
      return await createUserCart({ userId, product })
    }

    // If cart exist but don't have products
    if (!userCart.cart_products.length) {
      userCart.cart_products = [ product ]
      return await userCart.save()
    }

    // If cart exits and already have same products then update quantity
    const existingProduct = userCart.cart_products.find(p => p.productId === product.productId)
    if (existingProduct) {
      return await updateUserCartQuantity({ userId, product })
    }

    userCart.cart_products.push(product)
    return await userCart.save()
  }

  // Update cart
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]
    // Check product exits
    const foundProduct = await getProductById(productId)

    if (!foundProduct) throw new NotFoundError(`Product doesn't exits!`)
    
    // Check owner
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError(`Product do not belong to the shop!`)
    }
    
    // Remove product from cart if quantity = 0
    if (quantity === 0) {

    }

    return await updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    })
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: 'active' },
    updateSet = {
      $pull: {
        cart_products: {
          productId
        }
      }
    }
    
    const deleteCart = await cart.updateOne( query, updateSet )

    return deleteCart
  }

  static async getListCart({ userId }) {
    return await cart.findOne({
      cart_userId: +userId
    }).lean()
  }
}

module.exports = CartService