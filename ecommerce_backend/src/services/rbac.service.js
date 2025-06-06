"use strict";

const RESOURCE = require("../models/resource.model");
const ROLE = require("../models/role.model");

/**
 * new resource
 * @param {string} name
 * @param {string} slug
 * @param {string} description
 */
const createResource = async ({
  name = "profile",
  slug = "p00001",
  description = "",
}) => {
  try {
    // 1. Check name or slug exists

    // 2. new resource
    const resource = await RESOURCE.create({
      src_name: name,
      src_slug: slug,
      src_description: description,
    });

    return resource;
  } catch (error) {
    return error;
  }
};

const resourceList = async ({
  userId,
  limit = 30,
  offset = 0,
  search = "",
}) => {
  try {
    // 1. Check Admin ? middleware function

    // 2. Get list of resource
    const resources = await RESOURCE.aggregate([
      {
        $project: {
          _id: 0,
          name: "$src_name",
          slug: "$src_slug",
          description: "$src_description",
          resourceId: "$_id",
          createdAt: 1,
        },
      },
    ]);

    return resources;
  } catch (error) {
    return [];
  }
};

const createRole = async ({
  name = "shop",
  slug = "s0001",
  description = "extend from shop or user",
  grants = [],
}) => {
  try {
    // 1. Check role exists

    // 2. New role
    const role = await ROLE.create({
      rol_name: name,
      rol_slug: slug,
      rol_desciption: description,
      rol_grants: grants,
    });

    return role;
  } catch (error) {
    return error;
  }
};

const roleList = async ({
  userId = 0,
  limit = 30,
  offset = 0,
  search = "",
}) => {
  try {
    // 1. userId

    // 2. List roles

    const roles = await ROLE.aggregate([
      {
        $unwind: "$rol_grants",
      },
      {
        $lookup: {
          from: "Resources",
          localField: "rol_grants.resource",
          foreignField: "_id",
          as: "resource",
        },
      },
      {
        $unwind: "$resource",
      },
      {
        $project: {
          role: "$rol_name",
          resource: "$resource.src_name",
          action: "$rol_grants.actions",
          attributes: "$rol_grants.attributes",
        },
      },
      {
        $unwind: "$action",
      },
      {
        $project: {
          _id: 0,
          role: 1,
          resource: 1,
          action: "$action",
          attributes: 1,
        },
      },
    ]);

    return roles;
  } catch (error) {}
};

module.exports = {
  createResource,
  resourceList,
  createRole,
  roleList,
};
