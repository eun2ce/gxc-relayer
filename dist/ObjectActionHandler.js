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
const edit_json_file_1 = __importDefault(require("edit-json-file"));
const logger_1 = __importDefault(require("./logger"));
const demux_1 = require("demux");
const errors_1 = require("./errors");
const data = require("./config/.gxc-data.json");
//logger.info(Config.Dirty);
const file = edit_json_file_1.default();
logger_1.default.info(file.get("Config.Dirty"));
class ObjectActionHandler extends demux_1.AbstractActionHandler {
    constructor() {
        super(...arguments);
        this.isInitialized = true;
        this.state = {
            volumeBySymbol: {},
            totalTransfers: 0,
            indexState: {
                blockNumber: 0,
                blockHash: "",
                isReplay: false,
                handlerVersionName: "v1"
            },
        };
        this.stateHistory = {};
        this.stateHistoryMaxLength = 300;
    }
    get _handlerVersionName() { return this.handlerVersionName; }
    // tslint:disable-next-line
    handleWithState(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(this.state.indexState.blockNumber);
            //file.set("Dirty", true);
            //file.save();
            yield handle(this.state);
            //file.set("Dirty", false);
            //file.set("startAtBlock", this.state.indexState.blockNumber);
            //file.save();
            const { blockNumber } = this.state.indexState;
            this.stateHistory[blockNumber] = JSON.parse(JSON.stringify(this.state));
            if (blockNumber > this.stateHistoryMaxLength && this.stateHistory[blockNumber - this.stateHistoryMaxLength]) {
                delete this.stateHistory[blockNumber - this.stateHistoryMaxLength];
            }
        });
    }
    rollbackTo(blockNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestBlockNumber = this.state.indexState.blockNumber;
            const toDelete = [...Array(latestBlockNumber - (blockNumber)).keys()].map(n => n + blockNumber + 1);
            for (const n of toDelete) {
                delete this.stateHistory[n];
            }
            this.state = this.stateHistory[blockNumber];
        });
    }
    _runEffects(versionedActions, context, nextBlock) {
        this.runEffects(versionedActions, context, nextBlock);
    }
    loadIndexState() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.state.indexState;
        });
    }
    handleBlock(nextBlock, isReplay) {
        const _super = Object.create(null, {
            handleBlock: { get: () => super.handleBlock }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const { blockNumber, blockHash } = nextBlock.block.blockInfo;
            return _super.handleBlock.call(this, nextBlock, isReplay);
        });
    }
    updateIndexState(stateObj, block, isReplay, handlerVersionName) {
        return __awaiter(this, void 0, void 0, function* () {
            stateObj.indexState.blockNumber = block.blockInfo.blockNumber;
            stateObj.indexState.blockHash = block.blockInfo.blockHash;
            stateObj.indexState.isReplay = isReplay;
            stateObj.indexState.handlerVersionName = handlerVersionName;
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized) {
                throw new errors_1.NotInitializedError();
            }
        });
    }
}
exports.ObjectActionHandler = ObjectActionHandler;
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
//# sourceMappingURL=ObjectActionHandler.js.map