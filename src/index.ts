import logger from "./logger";
import Sentry from "./sentry";
import SCPush from "./statuscake";
import blockFile from "./data.json";

const requireKeys = (obj: any, keys: string[]) => {
   const missingKeys: string[] = [];

   for (const key of keys) {
      if (obj[key] === undefined) {
         missingKeys.push(key);
      }
      logger.debug(`Load ENV [${key}]: ${obj[key]}`);
   }

   if(missingKeys.length) {
      throw missingKeys;
   }
}

require("dotenv").config();
requireKeys(process.env, [
   "GXNODE_ENDPOINT",
]);

/*
if (process.env.SENTRY_DNS) {
   Sentry.init({ dsn: process.env.SENTRY_DNS });
}
*/

// WATCHER ACTION READER SETUP
import { BaseActionWatcher, IndexingStatus } from "demux";
import { NodeosActionReader } from "demux-eos";
import { ObjectActionHandler } from "./ObjectActionHandler";
import { handlerVersion } from "./handlerVersions/v1";

// LOCAL
// const actionReader = new NodeosActionReader (
//    "127.0.0.1:9999", // gxnode defult local endpoint
//    1                 // start at block
// );

const actionReader = new NodeosActionReader({
   nodeosEndpoint: process.env.GXNODE_ENDPOINT,
   startAtBlock: blockFile.startAtBlock,
});

const actionHandler = new ObjectActionHandler(
   [handlerVersion],
);

const actionWatcher = new BaseActionWatcher(
   actionReader,
   actionHandler,
   250,
);

async function main(timeInterval: number) {
   try{
      if ( actionWatcher.info.indexingStatus === IndexingStatus.Initial
         ||actionWatcher.info.indexingStatus === IndexingStatus.Stopped ) {
         logger.info("WATCH STARTING INDEXING.");
         actionWatcher.watch();
      }
      setTimeout(async () => await main(timeInterval), timeInterval);
      setTimeout(async () => await SCPush(), 10000);
      //setTimeout(async () => await SCPush(), 180000);
   } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
   }
};

actionReader.initialize().then(() => main(10000));

process.on("unhandledRejection", (err: Error)=> {
   Sentry.captureException(err);
   logger.error(err);
});
