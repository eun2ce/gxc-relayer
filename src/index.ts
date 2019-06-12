import logger from "./logger";
import SCPush from "./statuscake";
import blockFile from "./data.json";
import Sentry from "./sentry";

//GET CONFIG
require("dotenv").config();

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
      logger.info(new Date().toISOString(), " : check gxc-relayer alive");
      if ( actionWatcher.info.indexingStatus === IndexingStatus.Initial
         ||actionWatcher.info.indexingStatus === IndexingStatus.Stopped ) {
         logger.info("WATCH STARTING INDEXING.");
         actionWatcher.watch();
      }
      setTimeout(async () => await SCPush(), 180000);
   } catch (err) {
      Sentry.captureException(err);
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
