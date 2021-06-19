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
  DEBUG_MODE,
  // The interval to fetch the game status from the server (milliseconds)
  FETCH_GAME_STATUS_INTERVAL: 50,
  // Interval to fetch the opponent's name.
  FETCH_OPPONENT_STATUS_INTERVAL: 1000,
  // The time before the next numbers are sent.
  START_ROUND_WAIT_TIME: 3, // seconds
}
