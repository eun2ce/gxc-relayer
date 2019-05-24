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

const newcontract = async (payload) => {
   console.info("\n newContract \n");
   const floatValue = parseFloatEth(payload.data.value);
   const recipient = parseAccount(payload.data.recipient[1]);
   const timelock = Math.floor(Date.parse(((payload.data.timelock) + "Z")) / 1000);

   try {
      const result = await ethContract.methods.newContract(
         file.get("contract.vaultAddress"),
         recipient,
         file.get("contract.tokenContractId"),
         web3.utils.toWei(floatValue, "ether"),
         parseAccount(payload.data.hashlock),
         timelock
      ).send({ from: file.get("contract.vaultAddress"), gas: "0x47E7C4" });
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
