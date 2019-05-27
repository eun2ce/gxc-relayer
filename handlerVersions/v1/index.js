const { web3, ethContract } = require("./web3");
const { TextDecoder, TextEncoder } = require("util");
const { SerialBuffer, arrayToHex, hexToUint8Array } = require("eosjs/dist/eosjs-serialize");

const editJsonFile = require("edit-json-file");
const file = editJsonFile("./.gxc-data.json");

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

function parseAccount( act ) {
   const headAct = "0x";
   return headAct.concat(act);
}

const newcontract = async (payload) => {
   console.info("\n newContract \n");
   const floatValue = parseFloatEth(payload.data.value);
   const recipient = parseAccount(payload.data.recipient[1]);
   const timelock = Math.floor(Date.parse(((payload.data.timelock) + "Z")) / 1000);
   try {
      const txData = await ethContract.methods.newContract(
         recipient,
         file.get("contract.tokenContractId"),
         web3.utils.toWei(floatValue, "ether"),
         parseAccount(payload.data.hashlock),
         timelock,
         encodedHexName(payload.data.onwer)
      );

      const encodedTxData = await txData.encodeABI();
      const transactionObject = {
         gas: "0x47E7C4",
         data: encodedTxData,
         from: file.get("contract.vaultAddress"),
      };
     const result = await web3.eth.accounts.signTransaction(transactionObject, file.get("contract.vaultPK"), function (error, signedTx) {
         if (error) {
            console.log(error);
         } else {
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
               .on('receipt', function (receipt) {
                  console.info({receipt});
               });
         }
      });
      console.info({result});
   } catch(e) {
      console.info({e}); }
}

function updateNewcontractData(state, payload, blockInfo, context) {
   if(payload.data.recipient[0] !== "checksum160"){
      console.info(payload.data);
      return;
   }

   (async() => {
      const getContract = await ethContract.methods.getContract(payload.data.contract_name).call({ from: file.get("contract.vaultAddress") });
      if(getContract.sender === "0x0000000000000000000000000000000000000000"){
         (async () => await newcontract(payload))();
      } else { console.info({ getContract }) };
   })();
}

const updaters = [
  {
    actionType: "gxc.htlc::newcontract",
    apply: updateNewcontractData,
  },
]


/* Effects */

function logUpdate(payload, blockInfo, context) {
  //console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2))
}

const effects = [
/*
  {
    actionType: "gxc.token::transfer",
    run: logUpdate,
  },
*/
]

const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}

module.exports = handlerVersion
