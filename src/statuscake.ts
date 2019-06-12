import logger from "./logger";
import Sentry from "./sentry";

const https = require('https');
require("dotenv").config();

export default function SCPush() {
   return https.get( process.env.STATUSCAKE_API_KEY, (response) => {
      //logger.info("[STATUSCAKE] statusCode: ", response.statusCode, "headers: ", response.headers);
      response.on("end", () => {
         logger.info('Completed StatusCake Push');
      });
      response.on("error", (e) => {
         Sentry.captureException(e);
         logger.error(e);
      });
   });
}
