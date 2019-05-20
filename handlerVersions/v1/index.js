const { web3, ethContract } = require("./web3");

const editJsonFile = require("edit-json-file");
const file = editJsonFile("./.gxc-data.json");

function parseFloatEth( value ) {
   const int_value = value.split(" ", 1);
   return Number.parseFloat(int_value).toFixed(18);
}

function parseAccount( act ) {
   const headAct = "0x";
   return headAct.concat(act);
}

function convertTime( unixTime ){
   const sec = new Date(unixTime * 1000);
}

function updateNewcontractData(state, payload, blockInfo, context) {
   const floatValue = parseFloatEth( payload.data.value );
   const recipient = parseAccount(payload.data.recipient[1]);
   const timelock = Math.floor(Date.parse(payload.data.timelock)/1000);

   ethContract.methods.newContract(
      file.get("contract.vaultAddress"),
      recipient,
      file.get("contract.tokenContractId"),
      web3.utils.toWei(floatValue, "ether"),
      parseAccount(payload.data.hashlock),
      timelock
   ).send({
      from: file.get("contract.vaultAddress"),
      gas: "0x47E7C4"
   }, (error, result) => {
      console.info({ error, result });
   });
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
