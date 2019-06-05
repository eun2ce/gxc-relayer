import logger from "../../logger";
import Sentry from "../../sentry";
import { web3, htlc } from "./web3";
import { TextDecoder, TextEncoder } from "util";
import { SerialBuffer, arrayToHex, hexToUint8Array } from "eosjs/dist/eosjs-serialize";

require("dotenv").config();

function pad(n: string, width: number, z = "0"): string {
   z = z || "0";
   n = n + "";
   return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function encodeHexName(name: string): string {
   const buf = new SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: null
   });
   buf.pushName(name);

   const hexName = arrayToHex(buf.asUint8Array().reverse());
   return pad(hexName, 64);
}

function addPrefix(act: string, prefix = "0x" ): string {
   return prefix.concat(act);
}

/*
 * NOT USED
const confirmTransaction = async (transactionHash: string) => {
   console.info("confirm: \n", transactionHash);
   const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
   if(transactionReceipt === null) {
      console.info("transaction is pending .. \n transactionHash: %s, transactionReceipt: %o",transactionHash, transactionReceipt);
   }
   if(transactionReceipt.status === false) {
      console.info("transaction is fail .. \n transactionHash: %s, transactionReceipt: %o",transactionHash, transactionReceipt);
   }
}
*/

async function withdraw(payload: any): Promise<void> {
   try {
      const confirmWithdraw = await htlc.methods.withdraw(
         payload.data.contract_name,
         addPrefix(payload.data.preimage)
      ).call({
         from: web3.eth.defaultAccount,
         gas: process.env.WITHDRAW_GAS,
      });
      logger.info(`withdraw method call: ${confirmWithdraw}`);

      await htlc.methods.withdraw(
         payload.data.contract_name,
         addPrefix(payload.data.preimage)
      ).send({
         from: web3.eth.defaultAccount,
         gas: process.env.WITHDRAW_GAS,
      }, (error, result) => {
         if(!error) {
            logger.info({result});
         } else {
            logger.error({error});
         }
      });
   } catch(error) {
      logger.error(error);
      Sentry.captureException(error);
   }
}

async function newcontract(payload: any): Promise<void> {
   const floatValue = parseFloat(payload.data.value.split(" ",1)).toFixed(18);
   const recipient = addPrefix(payload.data.recipient[1]);
   const timelock = ((Math.floor(Date.parse(((payload.data.timelock) + "Z")) / 1000)) - 86400);
   const data = addPrefix(encodeHexName(payload.data.owner));

   try {
      const contractId = await htlc.methods.newContract(
         recipient,
         process.env.TOKEN_ADDRESS,
         web3.utils.toWei(floatValue, "ether"),
         addPrefix(payload.data.hashlock),
         timelock,
         data
      ).call({
         from: web3.eth.defaultAccount,
         gas: process.env.NEWCONTRACT_GAS,
      });
      logger.info(`newcontract method call: ${contractId}`);

      const result = await htlc.methods.newContract(
         recipient,
         process.env.TOKEN_ADDRESS,
         web3.utils.toWei(floatValue, "ether"),
         addPrefix(payload.data.hashlock),
         timelock,
         data
      ).send({
         from: web3.eth.defaultAccount,
         gas: process.env.NEWCONTRACT_GAS,
      });
      logger.info(result);
   } catch (error) {
      logger.error(error);
   }
}

async function updateNewcontractData(state: any, payload: any, blockInfo: any, context: any): Promise<void> {
   if(payload.data.recipient[0] !== "checksum160") {
      logger.info(payload.data);
      return;
   }

   try {
      const contract = await htlc.methods.haveContract(
         payload.data.contract_name
      ).call(
         {
            from: process.env.TOKEN_ADDRESS,
         }
      );

      if(!contract) {
         await newcontract(payload);
      } else {
         logger.info(`contractId "${payload.data.contract_name}" already exists`);
      }
   } catch (error) {
      logger.error(error);
      Sentry.captureException(error);
   }
}

async function updateWithdrawData(state: any, payload: any, blockInfo: any, context: any): Promise<void> {
   logger.info(payload);
   try {
   const contract = await htlc.methods.getContract(payload.data.contract_name)
      .call(
         {
            from: process.env.VAULT_ADDRESS,
         }
      );
   if (contract.contractId === payload.data.contract_name && contract.withdrawn == false) {
      await withdraw(payload);
   } else {
      logger.warn(`contractId ${payload.data.contract_name} already withdrawn`);
   }
   } catch (error) {
      logger.error(error);
   }
}

const updaters = [
   {
      actionType: "gxc.htlc::newcontract",
      apply: updateNewcontractData,
   },
   {
      actionType: "gxc.htlc::withdraw",
      apply: updateWithdrawData,
   },
]

function logUpdate(payload, blockInfo, context) {
  //console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2))
}

const effects = [
  {
    actionType: "gxc.token::transfer",
    run: logUpdate,
  },
]

export const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}

//export default handlerVersion;
//module.exports = handlerVersion
/*
const { web3, ethContract, file } = require("./web3");
const { TextDecoder, TextEncoder } = require("util");
const { SerialBuffer, arrayToHex, hexToUint8Array } = require("eosjs/dist/eosjs-serialize");

function pad(n, width, z = '0') {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function encodeHexName(name) {
   const buf = new SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: null
   });
   buf.pushName(name);

   const hexName = arrayToHex(buf.asUint8Array().reverse());
   return pad(hexName, 64);
}

function parseFloatEth( value ) {
   const int_value = value.split(" ", 1);
   return Number.parseFloat(int_value).toFixed(18);
}

function addPrefix( act, prefix = "0x" ) {
   return prefix.concat(act);
}

const confirmTransaction = async (transactionHash) => {
   console.info("confirm: \n", transactionHash);
   const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
   if(transactionReceipt === null) {
      console.info("transaction is pending .. \n transactionHash: %s, transactionReceipt: %o",transactionHash, transactionReceipt);
   }
   if(transactionReceipt.status === false) {
      console.info("transaction is fail .. \n transactionHash: %s, transactionReceipt: %o",transactionHash, transactionReceipt);
   }
}

const withdraw = async (payload) => {
   try {
      const confirmWithdraw = await ethContract.methods.withdraw(
         payload.data.contract_name,
         addPrefix(payload.data.preimage)
      ).call({
         from: web3.eth.defaultAccount,
         gas: file.get("contract.withdraw_gas"),
      });
      console.info({confirmWithdraw});

      await ethContract.methods.withdraw(
         payload.data.contract_name,
         addPrefix(payload.data.preimage)
      ).send({
         from: web3.eth.defaultAccount,
         gas: file.get("contract.withdraw_gas"),
      }, (error, result) => {
         if(!error) {
            console.info({result});
         } else {
            console.error({error});
         }
      });
   } catch(error) {
      console.error({error});
   }
}

const newcontract = async (payload) => {
   const floatValue = parseFloatEth(payload.data.value);
   const recipient = addPrefix(payload.data.recipient[1]);
   const timelock = ((Math.floor(Date.parse(((payload.data.timelock) + "Z")) / 1000)) - 86400);
   const data = addPrefix(encodeHexName(payload.data.owner));

   try {
      const contractId = await ethContract.methods.newContract(
         recipient,
         file.get("contract.tokenContractId"),
         web3.utils.toWei(floatValue, "ether"),
         addPrefix(payload.data.hashlock),
         timelock,
         data
      ).call({
         from: web3.eth.defaultAccount,
         gas: file.get("contract.newcontract_gas"),
      });
      console.info({contractId});

      const result = await ethContract.methods.newContract(
         recipient,
         file.get("contract.tokenContractId"),
         web3.utils.toWei(floatValue, "ether"),
         addPrefix(payload.data.hashlock),
         timelock,
         data
      ).send({
         from: web3.eth.defaultAccount,
         gas: file.get("contract.newcontract_gas"),
      });
      console.info({result});
   } catch (e) {
      console.log(e);
   }
}

function updateNewcontractData(state, payload, blockInfo, context) {
   if(payload.data.recipient[0] !== "checksum160") {
      console.info(payload.data);
      return;
   }

   (async () => {
      const contract = await ethContract.methods.haveContract(payload.data.contract_name).call({ from: file.get("contract.vaultAddress") });
      if(!contract) {
         await newcontract(payload);
      } else {
         console.log(`contractId "${payload.data.contract_name}" already exists`);
      }
   })();
}

function updateWithdrawData(state, payload, blockInfo, context) {
   console.info({payload});
   (async () => {
      const contract = await ethContract.methods.getContract(payload.data.contract_name).call({ from: file.get("contract.vaultAddress") });
      if (contract.contractId === payload.data.contract_name && contract.withdrawn == false) {
         await withdraw(payload);
      } else {
         console.info(`contractId ${payload.data.contract_name} already withdrawn`);
      }
   })();
}

const updaters = [
   {
      actionType: "gxc.htlc::newcontract",
      apply: updateNewcontractData,
   },
   {
      actionType: "gxc.htlc::withdraw",
      apply: updateWithdrawData,
   },
]

function logUpdate(payload, blockInfo, context) {
  //console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2))
}

const effects = [
  {
    actionType: "gxc.token::transfer",
    run: logUpdate,
  },
]

const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}

module.exports = handlerVersion
*/
