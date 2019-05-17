const Web3 = require('web3');
const request = require("request");
var contractAddress= "0xD9a918322f212E1A68452c7400f992d1ae1B1F7d";
var abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "contractId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "tokenContract",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "hashlock",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "name": "timelock",
          "type": "uint256"
        }
      ],
      "name": "LogHtlcNew",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "contractId",
          "type": "bytes32"
        }
      ],
      "name": "LogHtlcWithdraw",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "contractId",
          "type": "bytes32"
        }
      ],
      "name": "LogHtlcRefund",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "tokenContract",
          "type": "address"
        },
        {
          "name": "target",
          "type": "address"
        },
        {
          "name": "minAmount",
          "type": "uint256"
        },
        {
          "name": "minDuration",
          "type": "uint256"
        }
      ],
      "name": "configure",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "sender",
          "type": "address"
        },
        {
          "name": "recipient",
          "type": "address"
        },
        {
          "name": "tokenContract",
          "type": "address"
        },
        {
          "name": "amount",
          "type": "uint256"
        },
        {
          "name": "hashlock",
          "type": "bytes32"
        },
        {
          "name": "timelock",
          "type": "uint256"
        }
      ],
      "name": "newContract",
      "outputs": [
        {
          "name": "contractId",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "contractId",
          "type": "bytes32"
        },
        {
          "name": "preimage",
          "type": "bytes32"
        }
      ],
      "name": "withdraw",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "contractId",
          "type": "bytes32"
        }
      ],
      "name": "refund",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "contractId",
          "type": "bytes32"
        }
      ],
      "name": "getContract",
      "outputs": [
        {
          "name": "sender",
          "type": "address"
        },
        {
          "name": "recipient",
          "type": "address"
        },
        {
          "name": "tokenContract",
          "type": "address"
        },
        {
          "name": "amount",
          "type": "uint256"
        },
        {
          "name": "hashlock",
          "type": "bytes32"
        },
        {
          "name": "timelock",
          "type": "uint256"
        },
        {
          "name": "withdrawn",
          "type": "bool"
        },
        {
          "name": "refunded",
          "type": "bool"
        },
        {
          "name": "preimage",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];



const web3 = new Web3('ws://192.168.0.14:8545');
var provider = web3.currentProvider;
if (!web3.currentProvider) {
    web3.setProvider('ws://192.168.0.14:8545');
}

var ethContract = new web3.eth.Contract(abi, contractAddress);
console.log("connect web3")
module.exports = { web3, ethContract };
