"use strict";

const ProductService = require("../services/product.service");
const { SuccessResponse } = require("../core/success.response");
const { newSpu, oneSpu } = require("../services/spu.service");
const { oneSku } = require("../services/sku.service");

class ProductController {
  // SPU, SKU //

  /**
   * @desc Find one Spu info + Sku list
   */
  findOneSpu = async (req, res, next) => {
    try {
      const { product_id } = req.query;
      new SuccessResponse({
        message: "Product One",
        metadata: await oneSpu({ spu_id: product_id }),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc Find one product
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  findOneSku = async (req, res, next) => {
    try {
      const { sku_id, product_id } = req.query;

      new SuccessResponse({
        message: "Get sku one",
        metadata: await oneSku({ sku_id, product_id }),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc Create new Standard product unit
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  createSpu = async (req, res, next) => {
    try {
      const spu = await newSpu({
        ...req.body,
        product_shop: req.user.userId,
      });
      new SuccessResponse({
        message: "Success create spu",
        metadata: spu,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // END SPU, SKU //

  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new product success!",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product success!",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "unPublish product success!",
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // QUERY //
  /**
   * @description Get all draft product for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list draft product success!",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @description Get all publish product for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list publish product success!",
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @description Get list product by keywords
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search product success!",
      metadata: await ProductService.searchProducts(req.params),
    }).send(res);
  };

  /**
   * @description find all product by filter
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list find all product success!",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  /**
   * @description find product by id
   * @param {Number} id
   * @return { JSON }
   */
  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product detail success!",
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
  // END QUERY //
}

module.exports = new ProductController();
