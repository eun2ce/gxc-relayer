const { BaseActionWatcher } = require("demux");
const { NodeosActionReader, NodeosBlock } = require("demux-eos");
const ObjectActionHandler = require("./ObjectActionHandler");
const handlerVersion = require("./handlerVersions/v1");
const { web3, ethContract } = require("./handlerVersions/v1/web3");

const editJsonFile = require("edit-json-file");
const file = editJsonFile("./.gxc-data.json");

try {
   if( file.get("node-dirty") === true || file.get("dirty") === true ) {
      new Error ("dirty!");
   }
   file.set("node-dirty", true);
} catch (error) {
   console.info({error});
}

(async() => {
   try {
   const actionHandler = new ObjectActionHandler([handlerVersion]);

   const actionReader = new NodeosActionReader({
      startAtBlock: file.get("startAtBlock") === null ? 0 : file.get("startAtBlock") ,
         onlyIrreversible: false,
         nodeosEndpoint: "http://127.0.0.1:9999",
   });

   const actionWatcher = new BaseActionWatcher(
         actionReader,
         actionHandler,
         250,
   );
   actionWatcher.watch();
   } catch(e) {
      console.info({e});
   };
})()

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
   console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");

   file.set("node-dirty", false);
   console.log(file.get());
   file.save();

   console.log("Exiting...");
   process.exit(0);
  });
}

process.on('SIGINT', function () {
   console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");

   file.set("node-dirty", false);
   console.log(file.get());
   file.save();

   console.log("Exiting...");
   process.kill(process.pid, 'SIGINT');
   process.exit(0);
});

process.on('SIGTERM', function () {
   console.log("\nGracefully shutting down from SIGTERM");

   file.set("node-dirty", false);
   console.log(file.get());
   file.save();

   process.exit(0);
});
