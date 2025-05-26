"use strict";

const _ = require("lodash");

const getInfoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

// replacePlaceholder
const replacePlaceholder = (template, params) => {
  Object.keys(params).forEach((k) => {
    const placeholder = `{{$k}}`;
    template = template.replace(new RegExp(placeholder, "g"), params[k]);
  });

  return template;
};

module.exports = {
  getInfoData,
  getSelectData,
  getUnSelectData,
  replacePlaceholder,
};
