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
   actionWatcher.log.info("watcher state: ", actionWatcher.running); //DEBUG

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
