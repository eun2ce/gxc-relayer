const { BaseActionWatcher } = require("demux");
const { NodeosActionReader, NodeosBlock } = require("demux-eos");
const ObjectActionHandler = require("./ObjectActionHandler");
const handlerVersion = require("./handlerVersions/v1");
const { web3, ethContract } = require("./handlerVersions/v1/web3");

const editJsonFile = require("edit-json-file");
const file = editJsonFile("./.gxc-data.json");
const nodeFlags = require("node-flag");
const net =require("net-socket");

const url = String(file.get("node.nodeosEndpoint")).split(/[\s: | \/]+/);
const gxClient = net.connect(parseInt(url[2],10), url[1]);

if( file.get("node.dirty") === true ) {
   console.warn("=== node is dirty ! ===\n dirty is", file.get("node.dirty"));
   process.exit(1);
}

(async() => {
   const actionHandler = new ObjectActionHandler([handlerVersion]);

   const actionReader = new NodeosActionReader({
      startAtBlock: nodeFlags.isset("dirty")? 0 : ( file.get("node.startAtBlock") === null ? 0 : file.get("node.startAtBlock") ),
      onlyIrreversible: true,
      nodeosEndpoint: file.get("node.nodeosEndpoint") === null ? "127.0.0.1:9999" : file.get("node.nodeosEndpoint"),
   });

   const actionWatcher = new BaseActionWatcher(
      actionReader,
      actionHandler,
      250,
   );

   gxClient.on("connect", function() {
      actionWatcher.start();
   });

   gxClient.on("error", function() {
      console.error("not connected gxnode");
   });

   actionReader.initialize().then(() =>
      actionWatcher.start()
   );

})()

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
      gxClient.close();
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

