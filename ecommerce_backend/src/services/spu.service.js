"use strict";

const lodash = require("lodash");
const { BadRequestError } = require("../core/error.response");
const { findShopById } = require("../models/repositories/shop.repo");
const SPU_MODEL = require("../models/spu.model");
const { randomProductId } = require("../utils");
const { newSku, allSkuBySpuId } = require("./sku.service");

const newSpu = async ({
  product_id,
  product_name,
  product_thumb,
  product_description,
  product_price,
  product_category,
  product_shop,
  product_attributes,
  product_quantity,
  product_variations,
  sku_list = [],
}) => {
  try {
    // 1. Check if Shop exists
    const foundShop = await findShopById({
      shop_id: product_shop,
    });

    if (!foundShop) throw new BadRequestError("Shop not found");

    // 2. Create a new SPU
    const spu = await SPU_MODEL.create({
      product_id: randomProductId(),
      product_name,
      product_thumb,
      product_description,
      product_price,
      product_category,
      product_attributes,
      product_quantity,
      product_variations,
    });

    if (spu && sku_list.length) {
      // 3. create skus
      newSku({ sku_list, spu_id: spu.product_id })
        .then((result) => {
          console.log("SKUs created: ", result);
        })
        .catch((err) => {
          console.error("Error creating SKUs:", err);
        });
    }

    // 4. sync data via Elastic Search {search.service}

    // 5. response result
    return spu;
  } catch (error) {}
};

const oneSpu = async ({ spu_id }) => {
  try {
    const spu = await SPU_MODEL.findOne({
      product_id: spu_id,
      isPublished: false,
    });
    if (!spu) throw new BadRequestError("Spu not found");

    const skus = await allSkuBySpuId({ product_id: spu.product_id });

    return {
      spu_info: lodash.omit(spu, ["__v", "updatedAt"]),
      sku_list: skus.map((sku) =>
        lodash.omit(sku, ["__v", "updatedAt", "createdAt", "isDeleted"])
      ),
    };
  } catch (error) {
    return {};
  }
};

module.exports = {
  newSpu,
  oneSpu,
};
