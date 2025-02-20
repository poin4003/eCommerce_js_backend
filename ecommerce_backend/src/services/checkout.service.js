'use strict'

const {
  BadRequestError,
  NotFoundError,
} = require("../core/error.response")

const { 
  findCartById 
} = require("../models/repositories/cart.repo")

const { 
  checkProductByServer
} = require("../models/repositories/product.repo")

const {
  getDiscountAmount
} = require("./discount.service")
const { acquireLock, releaseLock } = require("./redis.service")

const { order } = require('../models/order.model')

class CheckoutService {
  static async checkoutReview({
    cartId, userId, shop_order_ids
  }) {
    // Check cartId exist
    const foundCart = await findCartById(cartId)
    if (!foundCart) throw new BadRequestError('Cart does not exits')

    const checkoutOrder = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0
    }, shop_order_ids_new = []

    // Calculate total of bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts = [], item_products = []} = shop_order_ids[i]
      // Check product available
      const checkProductServer = await checkProductByServer(item_products)

      if (!checkProductServer[0]) throw new BadRequestError('order wrong!!!')
        
      // Total order
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + (product.quantity * product.price)
      }, 0)

      // Total before checkout
      checkoutOrder.totalPrice += checkoutPrice

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // Total price before discount
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer
      }

      // if shop_discount exits and > 0, check if that available
      if (shop_discounts.length > 0) {
        const { totalPrice = 0, discount = 0} = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer
        })

        checkoutOrder.totalDiscount += discount
        
        // if total discount > 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount
        }
      }

      // Total
      checkoutOrder.totalCheckout += itemCheckout.priceApplyDiscount
      shop_order_ids_new.push(itemCheckout)
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkoutOrder
    }
  }

  // order
  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {}
  }) {
    const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({ 
      cartId, 
      userId, 
      shop_order_ids
    })

    // check again if that product have enough quantity in inventory
    // get new array Products
    const products = shop_order_ids.flatMap(order => order.item_products)
    const acquireProduct = []
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i]
      const keyLock = await acquireLock(productId, quantity, cartId)
      acquireProduct.push( keyLock ? true : false )
      if (keyLock) {
        await releaseLock(keyLock)
      }
    }

    // check if cart has out of stock product in inventory
    if (acquireProduct.includes(false)) {
      throw new BadRequestError('Some product has been update, please return to cart and check again...')
    }

    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new
    })

    // if insert successful then remove products has in cart
    if (newOrder) {
      // remove product in cart
    }

    return newOrder
  }

  /*
    1> Query orders [Users]
    2> Query detail order by id [Users]
    3> Cancel orders [Users]
    4> Update order status [Shop | Admin]
  */
  static async getOrdersByUser() {

  }

  static async getOneOrderByUser() {

  }

  static async cancelOrderByUser() {

  }

  static async updateOderStatusByShop() {
    
  }
}

module.exports = CheckoutService