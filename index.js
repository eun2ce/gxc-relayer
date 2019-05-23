const { BaseActionWatcher } = require("demux");
const { NodeosActionReader, NodeosBlock } = require("demux-eos");
const ObjectActionHandler = require("./ObjectActionHandler");
const handlerVersion = require("./handlerVersions/v1");
const { web3, ethContract } = require("./handlerVersions/v1/web3");

const editJsonFile = require("edit-json-file");
const file = editJsonFile("./.gxc-data.json");
const nodeFlags = require("node-flag");

if( file.get("node.dirty") === true ) {
   console.warn("=== node is dirty ! ===\n dirty is", file.get("node.dirty"));
   process.exit(1);
}

// main routine
const actionHandler = new ObjectActionHandler([handlerVersion]);
const actionReader = new NodeosActionReader({
   startAtBlock: file.get("node.startAtBlock") === null ? 1 : file.get("node.startAtBlock"),
   onlyIrreversible: true,
   nodeosEndpoint: file.get("node.nodeosEndpoint") === null ? "127.0.0.1:9999" : file.get("node.nodeosEndpoint"),
});
const actionWatcher = new BaseActionWatcher(
   actionReader,
   actionHandler,
   250,
);

const main = (timeInterval) => {
   if (!actionWatcher.running) {
      actionWatcher.log.info('Starting indexing.');
      actionWatcher.watch();
   }

   setTimeout(async () => await main(timeInterval), timeInterval);
};

actionReader.initialize().then(() => main(10000));

// error handle
process.on('uncaughtException', function (err) {
   setTimeout( function() {
      logger.error("*uncaughtException(), Exception : " + err.stack);
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

