'use strict'

const { 
  BadRequestError, 
  NotFoundError 
} = require("../core/error.response")
const {
  findAllProducts
} = require("../models/repositories/product.repo")
const {
  findAllDiscountCodesSelect,
  findAllDiscountCodesUnSelect, 
  checkDiscountExists
} = require("../models/repositories/discount.repo")
const discountModel = require("../models/discount.model")
/*
  Discount Service
  1 - Generator Discount Code [Shop | Admin]
  2 - Get Discount amount [User]
  3 - Get all discount codes [User | Shop]
  4 - Verify discount code [User]
  5 - Delete discount code [Admin | Shop]
  6 - Cancel discount code [User]
*/

class DiscountService {

  static async createDiscountCode(payload) {
    const {
      code, start_date, end_date, is_active, 
      shopId, min_order_value, product_ids, 
      applies_to, name, description, type,
      value, max_value, max_uses, uses_count,
      max_uses_per_user
    } = payload

    // Check priority
   
    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError('Start date must be before end date!')
    }

    // Create index for discount code
    const foundDiscount = await discountModel.findOne({ 
      discount_code: code,
      discount_shop_id: shopId,
    }).lean()

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount exits!')
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0, 
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: max_uses_per_user,
      discount_shop_id: shopId,
      discount_max_uses_per_user: max_uses_per_user, 
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids
    })

    return newDiscount
  }

  static async updateDiscountCode() {

  }

  /*
    Get all discount codes available with products
  */

  static async getAllDiscountCodeWithProduct({
    code, shopId, userId, limit, page
  }) {
    // Create index for discount code
    const foundDiscount = await discountModel.findOne({
      discount_code: code, 
      discount_shop_id: shopId
    }).lean()

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('discount not exits!')
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount

    let product
    if (discount_applies_to === 'all') {
      // get all product
      product = await findAllProducts({
        filter: {
          product_shop: shopId, 
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      })
    }

    if (discount_applies_to === 'specific') {
      // get the product ids
      product = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      })
    }

    return product
  }

  /*
    Get all discount codes of shop
  */

  static async getAllDiscountCodesByShop({
    limit, page,
    shopId
  }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shop_id: shopId,
        discount_is_active: true
      },
      unSelect: ['__v', 'discount_shopId'],
      model: discountModel
    })

    return discounts
  }

  /*
    Apply discount code
    products = {
      {
        productId,
        shopId,
        quantity,
        name, 
        price
      },
      {
        productId,
        shopId,
        quantity,
        name, 
        price
      }
    }
  */
  
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shop_id: shopId
      }
    })

    if (!foundDiscount) throw new NotFoundError(`discount doesn't exist`)
    
    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_type,
      discount_value,
      discount_users_used
    } = foundDiscount

    if (!discount_is_active) throw new NotFoundError(`discount expired!`)
    if (!discount_max_uses) throw new NotFoundError(`discount are out!`)
    // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
    //   throw new NotFoundError('discount ecode has expired!')
    // }

    // Check if mininum price
    let totalOrder = 0
    if (discount_min_order_value > 0) {
      // Get total
      totalOrder = products.reduce((acc, product) => {
        return acc + (product.quantity * product.price)
      }, 0)

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(`discount requries a mininum order value of ${discount_min_order_value}`)
      }
    }

    if (discount_max_uses_per_user > 0) {
      const useUserDiscount = discount_users_used.find( user => user.userId === userId)
      if (useUserDiscount) {
        throw NotFoundError(`discount are already use by user`)
      }
    }

    // Check if discount is fixed_amount
    const amount = discount_type === 'fix_amount' ? discount_value : totalOrder * (discount_value / 100)

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount
    }
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shop_id: shopId
    })

    return deleted
  }

  /*
    Cancel Discount Code() 
  */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shop_id: shopId
      }
    })

    if (!foundDiscount) throw new NotFoundError(`discount doesn't exits!`)

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1
      }
    })

    return result
  }
}

module.exports = DiscountService