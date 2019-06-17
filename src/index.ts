import logger from "./logger";
import SCPush from "./statuscake";
import blockFile from "./../src/config/data.json";
import Sentry from "./sentry";

//GET CONFIG
require("dotenv").config();

// WATCHER ACTION READER SETUP
import { BaseActionWatcher, IndexingStatus } from "demux";
import { MongoActionReader } from "demux-eos";
import { ObjectActionHandler } from "./ObjectActionHandler";
import { handlerVersion } from "./handlerVersions/v1";

// LOCAL
// const actionReader = new NodeosActionReader (
//    "127.0.0.1:9999", // gxnode defult local endpoint
//    1                 // start at block
// );
/*
const actionReader = new NodeosActionReader({
   nodeosEndpoint: process.env.GXNODE_ENDPOINT,
   startAtBlock: blockFile.startAtBlock,
});
 */
const actionReader = new MongoActionReader({
   dbName: process.env.MONGO_DB || "GXC",
   mongoEndpoint: process.env.MONGO_ENDPOINT || "mongodb://",
   onlyIrreversible: false,
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
   logger.info(new Date().toISOString(),`  :[${actionWatcher.info.indexingStatus}] check gxc-relayer alive`);
   try {
      actionWatcher.start();
   } catch (err) {
      //Sentry.captureException(err);
      logger.error(err);
   } finally {
      setTimeout(async () => await main(timeInterval), timeInterval);
   }
};

actionReader.initialize().then(() => main(10000));

process.on("unhandledRejection", (err: Error)=> {
   Sentry.captureException(err);
   logger.error(err);
});
