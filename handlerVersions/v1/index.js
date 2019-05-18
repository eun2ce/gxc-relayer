const { web3, ethContract } = require("./web3");

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
      "0x789679d8dd0c05e6ec99eb590a0c2b1730617b61",
      recipient,
      "0x1db7a487434a60e5bB2Ef90D7cB402fA09dAB62B",
      web3.utils.toWei(floatValue, "ether"),
      parseAccount(payload.data.hashlock),
      timelock
   ).send({
      from: "0x789679d8dd0c05e6ec99eb590a0c2b1730617b61",
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
