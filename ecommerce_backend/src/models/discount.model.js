'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'

const discountSchema = new Schema({
  discount_name: {
    type: String, 
    required: true
  },
  discount_description: {
    type: String,
    required: true
  },
  discount_type: {
    type: String,
    default: 'fix_amount' // percentage
  },
  discount_value: {
    type: Number,
    required: true
  },
  discount_code: {
    type: String,
    required: true
  },
  discount_start_date: {
    type: Date,
    required: true
  },
  discount_end_date: {
    type: Date,
    required: true
  },
  discount_max_uses: {
    type: Number,
    required: true
  },
  discount_uses_count: {
    type: Number,
    required: true
  },
  discount_users_used: {
    type: Array,
    default: []
  },
  discount_max_uses_per_user: {
    type: Number,
    required: true
  },
  discount_min_order_value: {
    type: Number,
    required: true,
    default: 0
  },
  discount_shop_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Shop',
  },
  discount_is_active: {
    type: Boolean,
    default: true
  },
  discount_applies_to: {
    type: String,
    required: true,
    enum: ['all', 'specific']
  },
  discount_product_ids: {
    type: Array,
    default: []
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, discountSchema)