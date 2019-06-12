import logger from "../../logger";
import Web3 from "web3";

require("dotenv").config();

const HashedTimelockGXCABI = require("../../config/HashedTimelockGXC.json").abi;

export const web3 = new Web3(process.env.ETH_PROVIDER);
export const htlc = new web3.eth.Contract(HashedTimelockGXCABI, process.env.HTLC_ADDRESS);

// DEFAULT USER SETTING
const account = web3.eth.accounts.privateKeyToAccount(process.env.VAULT_PK)
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

web3.eth.net.isListening().then(() => logger.info(`Connected to ETH network: ${process.env.ETH_PROVIDER}`));

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
