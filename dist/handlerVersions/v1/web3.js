"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../logger"));
const web3_1 = __importDefault(require("web3"));
require("dotenv").config();
const HashedTimelockGXCABI = require("../../config/HashedTimelockGXC.json").abi;
exports.web3 = new web3_1.default(process.env.ETH_PROVIDER);
exports.htlc = new exports.web3.eth.Contract(HashedTimelockGXCABI, process.env.HTLC_ADDRESS);
// DEFAULT USER SETTING
const account = exports.web3.eth.accounts.privateKeyToAccount(process.env.VAULT_PK);
exports.web3.eth.accounts.wallet.add(account);
exports.web3.eth.defaultAccount = account.address;
exports.web3.eth.net.isListening().then(() => logger_1.default.info(`Connected to ETH network: ${process.env.ETH_PROVIDER}`));
/*
const Web3 = require("web3");
const request = require("request");
const editJsonFile = require("edit-json-file");
const file = editJsonFile("./.gxc-data.json");

// GET CONFIG
const contractAddress = file.get("contract.address");
const abi = file.get("contract.abi");

// CONNECTING WEB3
const web3 = new Web3(file.get("contract.web3ServerAddress"));
const provider = web3.currentProvider;

if (!web3.currentProvider)
    web3.setProvider(file.get("contract.web3ServerAddress"));

// SET DEFAULT USER
const privateKey = file.get("contract.vaultPK");
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// SET CONTRACT
const ethContract = new web3.eth.Contract(abi, contractAddress);
console.info("web3 currentProvider host: ", web3.currentProvider.host);

module.exports = { web3, ethContract, file };
 */
//# sourceMappingURL=web3.js.map