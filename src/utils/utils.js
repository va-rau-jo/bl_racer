// --- CONSTANTS --- //
const DEBUG_MODE = true;

module.exports = {
  log: function(message) {
    if (DEBUG_MODE)
      console.log(message);
  },
  // Characters allowed in the answer input.
  ALLOWED_NUMS: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ALLOWED_OPS: ["+", "-", "*", "/"],
  // Length of a join code (letters).
  CODE_LENGTH: 1,
  DEBUG_MODE,
  // The interval to fetch the game status from the server (milliseconds)
  FETCH_GAME_STATUS_INTERVAL: 50,
  // How many points the first correct player receives.
  FIRST_SCORE: 10,
  // Interval to fetch the opponent's name.
  FETCH_OPPONENT_STATUS_INTERVAL: 1000,
  // How many points the second correct player receives.
  SECOND_SCORE: 5,
  // The time for the next round's numbers to be displayed (seconds).
  END_OF_ROUND_WAIT_TIME: 3,
  // Time a player has to answer correctly to get second chance points (seconds)
  SECOND_CHANCE_TIMEOUT: 5,
  // The time before the next numbers are sent.
  START_ROUND_WAIT_TIME: 3, // seconds
}
