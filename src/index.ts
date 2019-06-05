import logger from "./logger";
import * as Sentry from "@sentry/node";

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
   "ETH_PROVIDER",
   "GXNODE_STARTATBLOCK",
   "GXNODE_ENDPOINT",
   "SENTRY_DSN",
]);

if (process.env.SENTRY_DNS) {
   Sentry.init({ dsn: process.env.SENTRY_DNS });
}

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
   startAtBlock: parseInt(process.env.GXNODE_STARTATBLOCK, 10),
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
      const blockNum = await actionReader.getLastIrreversibleBlockNumber();

      if ( actionWatcher.info.indexingStatus === IndexingStatus.Initial
         ||actionWatcher.info.indexingStatus === IndexingStatus.Stopped ) {
         logger.info("WATCH STARTING INDEXING.");
         actionWatcher.watch();
      }
      setTimeout(async () => await main(timeInterval), timeInterval);
   } catch (err) {
      Sentry.captureException(err);
   }
};

actionReader.initialize().then(() => main(10000));

process.on("unhandledRejection", (err: Error)=> {
   Sentry.captureException(err);
   logger.error(err);
});

/*
const editJsonFile = require("edit-json-file");
const file = editJsonFile("./.gxc-data.json");
const nodeFlags = require("node-flag");

function getData(data){ return file.get(data); }

if( getData("node.dirty") === true ) {
   console.warn("DIRTY!");
   process.exit(1);
}

// WATCHER ACTION READER SETUP
const { BaseActionWatcher } = require("demux");
const { NodeosActionReader } = require("demux-eos");
const ObjectActionHandler = require("./ObjectActionHandler");
const handlerVersion = require("./handlerVersions/v1");

// LOCAL
// const actionReader = new NodeosActionReader(
//    "127.0.0.1:9999",
//    5407875
// );

const actionReader = new NodeosActionReader({
   nodeosEndpoint: getData("node.nodeosEndpoint"), // Locally hosted node needed for reasonable indexing speed
   startAtBlock: getData("node.startAtBlock"),
});

const actionHandler = new ObjectActionHandler(
   [handlerVersion],
);

const actionWatcher = new BaseActionWatcher(
   actionReader,
   actionHandler,
   250,
);

//MAIN ROUTES
async function main(timeInterval) {
   if(!actionWatcher.running) {
      actionWatcher.log.info("STARTING INDEXING.");
      actionWatcher.watch();
   }
   setTimeout(async () => await main(timeInterval), timeInterval);
};

actionReader.initialize().then(() => main(10000));

// HANDLE ERRORS
process.on("uncaughtException", function (err) {
   setTimeout( function() {
      console.error("*uncaughtException(), Exception : " + err.stack);
      process.exit(1);
   }, 1000);
});

if (process.platform === "win32") {
   const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
   });

   rl.on("SIGINT", function () {
      console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
      process.kill(process.pid, 'SIGINT');
      process.exit(0);
   });
};

process.on('SIGINT', function () {
   console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
   process.kill(process.pid, 'SIGINT');
   process.exit(0);
});

process.on('SIGTERM', function () {
   console.log("\nGracefully shutting down from SIGTERM");
   process.exit(0);
});
*/
