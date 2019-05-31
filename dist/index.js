"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const data = require("./config/.gxc-data.json");
const requireKeys = (obj, keys) => {
    const missingKeys = [];
    for (const key of keys) {
        if (obj[key] === undefined) {
            missingKeys.push(key);
        }
        logger_1.default.debug(`Load ENV [${key}]: ${obj[key]}`);
    }
    if (missingKeys.length) {
        throw missingKeys;
    }
};
require("dotenv").config();
requireKeys(process.env, [
    "ETH_PROVIDER",
    "GXNODE_ENDPOINT",
]);
// WATCHER ACTION READER SETUP
const demux_1 = require("demux");
const demux_eos_1 = require("demux-eos");
const ObjectActionHandler_1 = require("./ObjectActionHandler");
const v1_1 = require("./handlerVersions/v1");
// LOCAL
// const actionReader = new NodeosActionReader (
//    "127.0.0.1:9999", // gxnode defult local endpoint
//    1                 // start at block
// );
const actionReader = new demux_eos_1.NodeosActionReader({
    nodeosEndpoint: "http://127.0.0.1:9999",
    startAtBlock: 1,
});
const actionHandler = new ObjectActionHandler_1.ObjectActionHandler([v1_1.handlerVersion]);
const actionWatcher = new demux_1.BaseActionWatcher(actionReader, actionHandler, 250);
function main(timeInterval) {
    return __awaiter(this, void 0, void 0, function* () {
        if (actionWatcher.info.indexingStatus === demux_1.IndexingStatus.Initial
            || actionWatcher.info.indexingStatus === demux_1.IndexingStatus.Stopped) {
            logger_1.default.info("WATCH STARTING INDEXING.");
            actionWatcher.watch();
        }
        setTimeout(() => __awaiter(this, void 0, void 0, function* () { return yield main(timeInterval); }), timeInterval);
    });
}
;
actionReader.initialize().then(() => main(10000));
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
//# sourceMappingURL=index.js.map