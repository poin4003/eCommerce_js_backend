'use strict'

const ProductService = require('../services/product.service')
const { SuccessResponse } = require('../core/success.response')

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new product success!',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Publish product success!',
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      })
    }).send(res)
  }

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'unPublish product success!',
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      })
    }).send(res)
  }

  // QUERY //
  /**
   * @description Get all draft product for shop 
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list draft product success!',
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      })
    }).send(res)
  }

  /**
   * @description Get all publish product for shop 
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list publish product success!',
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
      })
    }).send(res)
  }

  /**
   * @description Get list product by keywords
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list search product success!',
      metadata: await ProductService.searchProducts(req.params)
    }).send(res)
  }

   /**
   * @description find all product by filter
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list find all product success!',
      metadata: await ProductService.findAllProducts(req.query)
    }).send(res)
  } 

   /**
   * @description find product by id
   * @param {Number} id
   * @return { JSON }
   */
  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get product detail success!',
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id
      })
    }).send(res)
  } 
  // END QUERY //
}

module.exports = new ProductController()