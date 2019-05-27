const Web3 = require("web3");
const request = require("request");
const file = require("../../.gxc-data.json");

const contractAddress = file.contract.address;
const abi = file.contract.abi;

const web3 = new Web3(file.contract.web3ServerAddress);

const provider = web3.currentProvider;
if (!web3.currentProvider) {
    web3.setProvider(file.contract.web3ServerAddress);
}

const privateKey = file.contract.vaultPK;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const ethContract = new web3.eth.Contract(abi, contractAddress);
console.info("web3 currentProvider host: ", web3.currentProvider.host);
module.exports = { web3, ethContract };
