const winston = require("winston");
require('winston-daily-rotate-file');

const INFO_LOG_FILE = './log/startAtBlock.json'
const ERROR_LOG_FILE = './log/error/error.log'

const logFormmat = winston.format.printf(
   info => `{"level": ${info.level};"startAtBlock": ${info.message};`
)

const jsonLogger: any = winston.createLogger({
   transports: [
      new (winston.transports.DailyRotateFile)({
         level: 'info',
         filename: INFO_LOG_FILE,
         format: winston.format.json(),
         defaultMeta: logFormmat,
         maxsize: 5242880, //5MB
         maxFile: 1,
      }),
      new (winston.transports.File)({
         level: 'error',
         filename: ERROR_LOG_FILE,
         format: logFormmat
      })
   ]
})

export default jsonLogger
