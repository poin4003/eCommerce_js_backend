'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')
const { 
  findAllDraftsForShop, 
  findAllPublishForShop,
  publishProductByShop, 
  searchProductByUser,
  findAllProducts,
  findProduct
} = require('../models/repositories/product.repo')
const { insertInventory } = require('../models/repositories/inventory.repo')
const NotificationService = require('./notification.service')

// Define factory class to create product
class ProductFactory {
  /*
    type: category, exp: Clothing or Electronics
    payload: input data
  */

  static productRegistry = {}

  static registerProductType( type, classRef ) {
    ProductFactory.productRegistry[type] = classRef
  } 

  static async createProduct( type, payload ) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid product types ${type}`)

    return new productClass(payload).createProduct()
  }

  static async updateProduct( type, payload ) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid product types ${type}`)
    
    return new productClass(payload).createProduct()
  }

  // PUT //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id })
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id })
  } 
  // END PUT //

  // QUERY //
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftsForShop({ query, limit, skip })
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishForShop({ query, limit, skip })
  }

  static async searchProducts({ keySearch }) {
    return await searchProductByUser({ keySearch })
  }

  static async findAllProducts ({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
    return await findAllProducts({ limit, sort, filter, page,
      select: ['product_name', 'product_price', 'product_thumb', 'product_shop']
    })
  }

  static async findProduct ({ product_id }) {
    return await findProduct({ product_id, unSelect: ['__v', 'product_variations'] })
  }

  // END QUERY //
}

// Define basic product class
class Product {
  constructor({
    product_name, 
    product_thumb, 
    product_description,
    product_price,
    product_type,
    product_shop,
    product_attributes,
    product_quantity
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
    this.product_quantity = product_quantity
  }

  // Create new product
  async createProduct( product_id ) {
    const newProduct = await product.create({
      ...this,
      _id: product_id
    })

    if (newProduct) {
      // add product stock in inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity
      })
      // push noti to system collection
      NotificationService.pushNotiToSystem({
        type: 'SHOP-001',
        receivedId: 1, 
        senderId: this.product_shop,
        options: {
          product_name: this.product_name,
          shop_name: this.product_shop
        }
      }).then(rs => console.log(rs))
      .catch(console.error)
    }

    return newProduct
  }
}

// Define sub-class for different product types clothing
class Clothing extends Product {

  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newClothing) throw new BadRequestError('Create new clothing error')
    
    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) throw new BadRequestError('Create new product error')

    return newProduct
  }
}

class Electronics extends Product {

  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newElectronics) throw new BadRequestError('Create new electronics error')

    const newProduct = await super.createProduct(newElectronics._id)
    if (!newProduct) throw new BadRequestError('Create new product error')

    return newProduct
  }
}

class Furniture extends Product {

  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newFurniture) throw new BadRequestError('Create new furnitures error')

    const newProduct = await super.createProduct(newFurniture._id)
    if (!newProduct) throw new BadRequestError('Create new product error')
      
    return newProduct
  }
}

// Register product types
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory;
