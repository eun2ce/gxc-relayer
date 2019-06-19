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

async function refund(payload: any): Promise<void> {
   try {
      htlc.methods.refund(
         payload.data.contract_name
      ).call({
         from: web3.eth.defaultAccount,
         gas: process.env.NEWCONTRACT_GAS
      }, (error, result) => {
         if(error) {
            logger.error(error);
         }
         logger.info(result);
      });

      htlc.methods.refund(
         payload.data.contract_name
      ).send({
         from: web3.eth.defaultAccount,
         gas: process.env.NEWCONTRACT_GAS
      }, (error, result) => {
         if(error) {
            logger.error(error);
         }
         logger.info(result);
      });
   } catch (error) {
      Sentry.captureException(error);
      logger.error(error);
   }
}

async function withdraw(payload: any): Promise<void> {
   try {
      htlc.methods.withdraw(
         payload.data.contract_name,
         addPrefix(payload.data.preimage)
      ).call({
         from: web3.eth.defaultAccount,
         gas: process.env.WITHDRAW_GAS,
      }, (error, result) => {
         if(error) {
            logger.error(error);
         }
         logger.info(result);
      });

      htlc.methods.withdraw(
         payload.data.contract_name,
         addPrefix(payload.data.preimage)
      ).send({
         from: web3.eth.defaultAccount,
         gas: process.env.WITHDRAW_GAS,
      }).on('transactionHash', (hash) => {
            logger.info("transaction Hash", hash);
         }).on('receipt', (receipt) => {
            logger.info("receipt", receipt);
         }).on('error', console.error);
   } catch(error) {
      Sentry.captureException(error);
      logger.error(error);
   }
}

async function newcontract(payload: any): Promise<void> {
   const floatValue = parseFloat(payload.data.value.split(" ",1)).toFixed(18);
   const recipient = addPrefix(payload.data.recipient[1]);
   const timelock = ((Math.floor(Date.parse(((payload.data.timelock) + "Z")) / 1000)) - 86400);
   const data = addPrefix(encodeHexName(payload.data.owner));

   try {
      htlc.methods.newContract(
         recipient,
         process.env.TOKEN_ADDRESS,
         web3.utils.toWei(floatValue, "ether"),
         addPrefix(payload.data.hashlock),
         timelock,
         data
      ).call({
         from: web3.eth.defaultAccount,
         gas: process.env.NEWCONTRACT_GAS,
      }, (error, result) => {
         if(error) {
            logger.error(error);
         }
         logger.info(result);
      });

      htlc.methods.newContract(
         recipient,
         process.env.TOKEN_ADDRESS,
         web3.utils.toWei(floatValue, "ether"),
         addPrefix(payload.data.hashlock),
         timelock,
         data
      ).send({
         from: web3.eth.defaultAccount,
         gas: process.env.NEWCONTRACT_GAS,
      })
         .on('transactionHash', (hash) => {
            logger.info("transacion Hash: ", hash);
         })
         .on('receipt', (receipt) => {
            logger.info("receipt", receipt);
         }).on('error', console.error);
   } catch (error) {
      Sentry.captureException(error);
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
         ,(error, result) => {
            if(error) {
               logger.error(error);
            }
            logger.info(result);
         });

      if(!contract) {
         await newcontract(payload);
      } else {
         logger.info(`contractId "${payload.data.contract_name}" already exists`);
      }
   } catch (error) {
      Sentry.captureException(error);
      logger.error(error);
   }
}

async function updateWithdrawData(state: any, payload: any, blockInfo: any, context: any): Promise<void> {
   logger.info(payload);
   try {
       htlc.methods.getContract(payload.data.contract_name)
         .call(
            {
               from: process.env.VAULT_ADDRESS,
            }, (error, contract)=> {
               if(error) {
                  logger.error(error);
               }
               if (contract.contractId === payload.data.contract_name && contract.withdrawn == false) {
                  withdraw(payload);
               } else {
                  logger.warn(`contractId ${payload.data.contract_name} already withdrawn`);
               }

         });
   } catch (error) {
      Sentry.captureException(error);
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
   {
      actionType: "gxc.htlc::refund",
      apply: refund,
   }
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
