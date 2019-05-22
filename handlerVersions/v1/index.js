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

function updateNewcontractData(state, payload, blockInfo, context) {
   console.log('\x1b[44m', 'newContract','\n\x1b[0m');
   if(payload.data.recipient[0] !== "checksum160") {
      console.info(payload.data);
      return;
   }
   const floatValue = parseFloatEth( payload.data.value );
   const recipient = parseAccount(payload.data.recipient[1]);
   const timelock = Math.floor(Date.parse(((payload.data.timelock)+"Z"))/1000);

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
   }, (error, txID) => {
      console.info("error: ", error, "txHash: ", txID);
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
