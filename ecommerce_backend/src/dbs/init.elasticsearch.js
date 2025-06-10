"use strict";

const { Client } = require("@elastic/elasticsearch");

let clients = {};

const instanceEventListener = async () => {
  try {
    await clients.elasticClient.ping();
    console.log("Successfully connected elasticsearch");
  } catch (error) {
    console.error("Error connecting to elasticsearch", error);
  }
};

const init = ({
  ELASTICSEARCH_IS_ENABLED,
  ELASTICSEARCH_IS_HOSTS = "http://localhost:9200",
}) => {
  if (ELASTICSEARCH_IS_ENABLED) {
    const elasticClient = new Client({ node: ELASTICSEARCH_IS_HOSTS });
    clients.elasticClient = elasticClient;
    // handler connect
    instanceEventListener(elasticClient);
  }
};

const getClients = () => clients;

const closeConnections = () => {};

module.exports = {
  init,
  getClients,
  closeConnections,
};
