const { AbstractActionHandler } = require("demux");
const editJsonFile = require("edit-json-file");
const file = editJsonFile("./.gxc-data.json", { autosave:true});

let state = {
  volumeBySymbol: {},
  totalTransfers: 0,
  indexState: {
    blockNumber: 0,
    blockHash: "",
    isReplay: false,
    handlerVersionName: "v1",
  },
}

const stateHistory = {}
const stateHistoryMaxLength = 300

class ObjectActionHandler extends AbstractActionHandler {
   async handleWithState(handle) {
      file.set("node.dirty", true);
      file.save();
      await handle(state)
      file.set("node.dirty", false);
      file.set("node.startAtBlock", state.indexState.blockNumber);
      file.save();
      const { blockNumber } = state.indexState
      stateHistory[blockNumber] = JSON.parse(JSON.stringify(state))
      if (blockNumber > stateHistoryMaxLength && stateHistory[blockNumber - stateHistoryMaxLength]) {
         delete stateHistory[blockNumber - stateHistoryMaxLength]
      }
   }

   async loadIndexState() {
      return state.indexState
   }

   async updateIndexState(stateObj, block, isReplay, handlerVersionName) {
      stateObj.indexState.blockNumber = block.blockInfo.blockNumber
      stateObj.indexState.blockHash = block.blockInfo.blockHash
      stateObj.indexState.isReplay = isReplay
      stateObj.indexState.handlerVersionName = handlerVersionName
   }

   async rollbackTo(blockNumber) {
      const latestBlockNumber = state.indexState.blockNumber
      const toDelete = [...Array(latestBlockNumber - (blockNumber)).keys()].map(n => n + blockNumber + 1)
      for (const n of toDelete) {
         delete stateHistory[n]
      }
      state = stateHistory[blockNumber]
   }

   async setup() {
   }
}

module.exports = ObjectActionHandler
