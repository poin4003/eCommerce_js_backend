'use strict'

const { product, electronic, clothing, furniture } = require('../../models/product.model')
const { getSelectData, getUnSelectData } = require('../../utils/index')

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch)
  const results = await product.find({
    isPublished: true,
    $text: { $search: regexSearch }
    }, {score: { $meta: 'textScore' } 
  }).
  sort({score: {$meta: 'textScore'}}).
  lean()

  return results
}

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: product_shop,
    _id: product_id
  })

  if (!foundShop) return null

  const result = await product.updateOne(
    { product_shop: product_shop, _id: product_id },
    { $set: { isDraft: false, isPublished: true } }
  )

  return result.modifiedCount
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: product_shop,
    _id: product_id
  })

  if (!foundShop) return null 

  const result = await product.updateOne(
    { product_shop: product_shop, _id: product_id }, 
    { $set: { isDraft: true, isPublished: false } }
  )

  return result.modifiedCount
}

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const products = await product.find( filter ). 
    sort(sortBy).
    skip(skip). 
    limit(limit).
    select(getSelectData(select)).
    lean()

  return products
}

const findProduct = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(getUnSelectData(unSelect))
}

const queryProduct = async ({ query, limit, skip }) => {
  return await product.find(query). 
    populate('product_shop', 'name email -_id'). 
    sort({ updateAt: -1 }). 
    skip(skip).
    limit(limit). 
    lean().
    exec()
}

const getProductById = async (productId) => {
  return await product.findOne({ _id: productId }).lean()
}

const checkProductByServer = async (products) => {
  return await Promise.all(products.map(async product => {
    const foundProduct = await getProductById(product.productId)
    if (foundProduct) {
      return {
        price: foundProduct.product_price,
        quantity: product.quantity,
        productId: product.productId
      }
    }
  }))
}

module.exports = {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  getProductById,
  checkProductByServer
}