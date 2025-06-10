const { getClients, init } = require("../../dbs/init.elasticsearch");
init({
  ELASTICSEARCH_IS_ENABLED: true,
});

const esClient = getClients().elasticClient;

// search document
const searchDocument = async (idxName, payload) => {
  const result = await esClient.search({
    index: idxName,
    body: {
      size: 20
    },
  });

  console.log(`search::`, result?.body?.hits?.hits);
};

const addDocument = async ({ idxName, id, payload }) => {
  try {
    const newDoc = await esClient.index({
      index: idxName,
      id,
      body: payload,
    });

    console.log(`Add new::`, newDoc.body);
  } catch (error) {
    console.error("Error adding document:", error);
  }
};

// test
// addDocument({
//   idxName: "product_v001",
//   id: "11113333",
//   payload: {
//     title: "Iphone 111333",
//     price: 11113333,
//     images: "...",
//     category: "mobile",
//   },
// }).then((rs) => console.log(rs));

searchDocument("product_v001").then()

// module.exports = {
//   searchDocument,
//   addDocument
// }
