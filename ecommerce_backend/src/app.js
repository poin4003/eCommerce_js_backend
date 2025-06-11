const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const myLogger = require("./loggers/mylogger.log");
// Init config
require("dotenv").config();

// Init db
require("./dbs/init.mongodb");
const initRedis = require("./dbs/init.redis");
initRedis.initRedis();
const initElasticSearch = require("./dbs/init.elasticsearch");
initElasticSearch.init({
  ELASTICSEARCH_IS_ENABLED: true,
});
const ioredis = require("./dbs/init.ioredis");
ioredis.initIORedis({
  IOREDIS_IS_ENABLED: true,
  IOREDIS_HOST: "localhost",
});

// Check overload
// const { checkOverload } = require('./helpers/check.connect')
// checkOverload()

// test pub sub redis
require("./tests/inventory.test");
const productTest = require("./tests/product.test");

productTest.purchaseProduct("product:001", 10);

const app = express();

// Init middlewares
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"];
  req.requestId = requestId ? requestId : uuidv4();
  myLogger.log(`input params ::${req.method}`, [
    req.path,
    { requestId: req.requestId },
    req.method === "POST" ? req.body : req.query,
  ]);

  next();
});

// Init Router
app.use("/", require("./routes"));

// Handle rrrors
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(err);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  const resMessage = `${statusCode} - ${
    Date.now() - error.now
  }ms - Response: ${JSON.stringify(error)}`;

  myLogger.error(error.message, [
    req.path,
    { requestId: req.requestId },
    {
      message: resMessage,
    },
  ]);
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "internal server error",
  });
});

module.exports = app;
