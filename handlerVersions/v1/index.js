const { web3, ethContract } = require("./web3")

function parseFloatEth( value ) {
   const int_value = value.split(" ", 1)
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
   //address sender, address recipient, address tokenContract, uint256 amount, bytes32 hashlock, uint256 timelock
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


/* Effects
 * Effect `run` functions are much like Updater `apply` functions, with the following differences:
 *   - `state` is not provided
 *   - functions are non-blocking, run asyncronously
 * These functions are not provided `state` because providing a way to access state outside of updaters would make them
 * non-deterministic. The purpose of Effect `run` functions is side-effects, which affect state out of the bounds of the
 * control of the `state` object.
 *
 * In this example, we're utilizing it very simply to output the current running token transfer totals to the console.
 */

function logUpdate(payload, blockInfo, context) {
  //console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2))
}

const effects = [
/*
  {
    actionType: "eosio.token::transfer",
    run: logUpdate,
  },
*/
]


/*
 * Handler Versions
 * In actual applications, there may be a need to change Updater and Effects in tandem with blockchain actions (such as
 * updating a contract). Demux gives you this ability by segmenting named sets of Updaters and Effects through an
 * interface called `HandlerVersion`. By default, the first Handler Version used will be whichever one has the name
 * "v1". To change Handler Versions with an Updater, simply return the name of the Handler Version from the Updater's
 * `apply` function, and if a Handler Version exists with that name, the Updaters and Effects of that version will be
 * used from that point forward.
 *
 * Since this is a simple example, we will only be using a single Handler Version, "v1".
 */

const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}

module.exports = handlerVersion
