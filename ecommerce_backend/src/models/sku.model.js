"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Sku";
const COLLECTION_NAME = "skus";

const skuSchema = new Schema(
  {
    sku_id: { type: String, required: true, unique: true },
    sku_tier_idx: { type: Array, default: [0] },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    sku_default: { type: Boolean, default: false},
    sku_slug: { type: String, default: '' },
    sku_sort: { type: Number, default: 0 },
    sku_price: { type: String, required: true },
    sku_stock: { type: Number, default: 0 },
    product_id: { type: String, required: true }, // ref to spu product
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, skuSchema);
