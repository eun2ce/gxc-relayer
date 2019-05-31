import editJsonFile from "edit-json-file";
import * as Config from './config/.gxc-data.json';
import logger from "./logger";
import { AbstractActionHandler } from "demux";
import { NotInitializedError } from "./errors";
import { IndexState, NextBlock, VersionedAction } from "./interfaces";

export class ObjectActionHandler extends AbstractActionHandler {
   public isInitialized: boolean = true

   public state: any = {
      volumeBySymbol: {},
      totalTransfers: 0,
      indexState: {
         blockNumber: 0,
         blockHash: "",
         isReplay: false,
         handlerVersionName: "v1"
      },
   }

   private stateHistory = {}
   private stateHistoryMaxLength = 300

   get _handlerVersionName() { return this.handlerVersionName }

   // tslint:disable-next-line
   public async handleWithState(handle: (state: any) => void) {
      logger.info(this.state.indexState.blockNumber);
      //file.set("Dirty", true);
      //file.save();
      await handle(this.state)
      //file.set("Dirty", false);
      //file.set("startAtBlock", this.state.indexState.blockNumber);
      //file.save();
      const { blockNumber } = this.state.indexState
      this.stateHistory[blockNumber] = JSON.parse(JSON.stringify(this.state))
      if (blockNumber > this.stateHistoryMaxLength && this.stateHistory[blockNumber - this.stateHistoryMaxLength]) {
         delete this.stateHistory[blockNumber - this.stateHistoryMaxLength]
      }
   }

   public async rollbackTo(blockNumber: number) {
      const latestBlockNumber = this.state.indexState.blockNumber;
      const toDelete = [...Array(latestBlockNumber - (blockNumber)).keys()].map(n => n + blockNumber + 1)
      for (const n of toDelete) {
         delete this.stateHistory[n]
      }
      this.state = this.stateHistory[blockNumber]
   }

   public _runEffects(
      versionedActions: VersionedAction[],
      context: any,
      nextBlock: NextBlock,
   ) {
      this.runEffects(versionedActions, context, nextBlock)
   }

   protected async loadIndexState(): Promise<IndexState> {
      return this.state.indexState
   }

   public async handleBlock(
      nextBlock: NextBlock,
      isReplay: boolean,
   ): Promise<number | null> {
      const { blockNumber, blockHash } = nextBlock.block.blockInfo
      return super.handleBlock(nextBlock, isReplay)
   }
   protected async updateIndexState(stateObj, block, isReplay, handlerVersionName) {
      stateObj.indexState.blockNumber = block.blockInfo.blockNumber;
      stateObj.indexState.blockHash = block.blockInfo.blockHash;
      stateObj.indexState.isReplay = isReplay;
      stateObj.indexState.handlerVersionName = handlerVersionName;
   }

   protected async setup(): Promise<void> {
      if (!this.isInitialized) {
         throw new NotInitializedError();
      }
   }
}


/*
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
*/
