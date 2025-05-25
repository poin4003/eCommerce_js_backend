"use strict";

const winston = require("winston");
const { combine, timestamp } = winston.format;
require("winston-daily-rotate-file");
const { v4: uuidv4 } = require("uuid");

class MyLogger {
  constructor() {
    const formatPrint = winston.format.printf(
      ({ level, message, context, requestId, timestamp, metadata }) => {
        return `${timestamp}::${level}::${context}::${requestId}::${message}::${metadata}::${JSON.stringify(
          metadata
        )}`;
      }
    );

    this.logger = winston.createLogger({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        formatPrint
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          dirname: "src/logs",
          filename: "application-%DATE%.info.log",
          datePattern: "YYYY-MM-DD-HH-mm",
          zippedArchive: true,
          maxSize: "1m",
          maxFiles: "14d",
          format: combine(
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            formatPrint
          ),
          level: "info",
        }),
        new winston.transports.DailyRotateFile({
          dirname: "src/logs",
          filename: "application-%DATE%.error.log",
          datePattern: "YYYY-MM-DD-HH-mm",
          zippedArchive: true,
          maxSize: "1m",
          maxFiles: "14d",
          format: combine(
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            formatPrint
          ),
          level: "error",
        }),
      ],
    });
  }

  commonParams(params) {
    let context, req, metadata;
    if (!Array.isArray(params)) {
      context = params;
    } else {
      [context, req, metadata] = params;
    }

    const requestId = req?.requestId || uuidv4();
    return {
      requestId,
      context,
      metadata,
    };
  }

  log(message, params) {
    const paramLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramLog
    );

    this.logger.info(logObject);
  }

  error(message, params) {
    const paramLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramLog
    );

    this.logger.error(logObject);
  }
}

module.exports = new MyLogger();
