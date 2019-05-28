const Web3 = require("web3");
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
