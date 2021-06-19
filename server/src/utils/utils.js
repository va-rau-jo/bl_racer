// --- CONSTANTS --- //
const DEBUG_MODE = true;

module.exports = {
  log: function(message) {
    if (DEBUG_MODE)
      console.log(message);
  },
  // Length of a join code (letters).
  CODE_LENGTH: 1,
  DEBUG_MODE,
  // How many points the first correct player receives.
  FIRST_SCORE: 10,
  // How many points the second correct player receives.
  SECOND_SCORE: 5,
  // The time for the next round's numbers to be displayed (seconds).
  END_OF_ROUND_WAIT_TIME: 3,
  // Time a player has to answer correctly to get second chance points (seconds)
  SECOND_CHANCE_TIMEOUT: 5,
}
