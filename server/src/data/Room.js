"use strict";
const room_utils = require("../utils/room-utils");
const utils = require("../utils/utils");

// Declare the constructor and member properties.
class Room {
  constructor(host, rounds) {
    this.generateCode();
    this.gameOver = false;
    this.player1 = host;
    this.player2 = null;
    this.nums = null;
    this.round = 0;
    this.rounds = rounds;
    this.secondAnswerTimeout = null;
  }

  // Define static members directly on the Constructor function.
  addPlayer(player) {
    if (this.player2 === null)
      this.player2 = player;
    else
      utils.log("Cannot add another player");
    return null;
  }

  advanceRound() {
    utils.log("advancing to next round soon...")
    clearTimeout(this.secondAnswerTimeout);
    this.secondAnswerTimeout = null;

    if (this.round === this.rounds) {
       setTimeout(() => {
        this.round++;
        this.gameOver = true;
        utils.log("GAME OVER");
       }, utils.END_OF_ROUND_WAIT_TIME * 1000);
    } else {
      setTimeout(() => {
        this.round++;
        this.player1.answer = null;
        this.player1.correct = null;

        this.player2.answer = null;
        this.player2.correct = null;

        this.generateNumbers();
        utils.log("Now on round " + this.round);
      }, utils.END_OF_ROUND_WAIT_TIME * 1000);
    }
  }

  /**
   * Given an answer array, will check if the answer is correct. If it is,
   * we increase the players score, set a timer to wait for the opponent's
   * answer, etc.
   * @param {Array} answer An array with the numbers and operations used in
   * their answer
   * @param {boolean} isHost True if the player is the host
   */
  checkAnswer(answer, isHost) {
    let correct = room_utils.checkAnswer(answer, this.nums);

    let player = isHost ? this.player1 : this.player2;
    let opponent = !isHost ? this.player1 : this.player2;
    // Second statement checks if you were too late
    player.correct = correct && !(opponent.correct && this.secondAnswerTimeout === null);

    if (player.correct) {
      let score = opponent.correct ? utils.SECOND_SCORE : utils.FIRST_SCORE;
      player.answer = answer;
      player.score += score;
      player.scores.push(score);

      if (opponent.correct) {
        utils.log("fast forwarding")
        this.advanceRound();
      } else { // start timer
        utils.log(opponent.name + " has " + utils.SECOND_CHANCE_TIMEOUT +
          " seconds to answer");

        this.secondAnswerTimeout = setTimeout(() => {
          utils.log("opponent sucks")
          opponent.scores.push(0);
          this.advanceRound();
        }, utils.SECOND_CHANCE_TIMEOUT * 1000)
      }
    }
    return player.correct;
  }

  /**
   * Sets this.code to a random CODE_LENGTH size string of letters
   */
  generateCode() {
    let result = [];
    let characters = 'A' //'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let n = characters.length;
    for (let i = 0; i < utils.CODE_LENGTH; i++) {
      result.push(characters.charAt(Math.floor(Math.random() * n)));
    }
    this.code = result.join('');
  }

  /**
   * Generates 3 numbers between 0 and 9 and sets this.nums
   */
  generateNumbers() {
    this.nums = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];

    utils.log("numbers are: " + this.nums[0] + " " + this.nums[1] + " " +
      this.nums[2]);
  }

  /**
   * Resets game, requires players to ready up again before starting.
   */
  resetGame() {
    this.gameOver = false;
    this.nums = null;
    this.round = 0;
    this.secondAnswerTimeout = null;

    if (this.player1 !== null)
      this.player1.reset();

    if (this.player2 !== null)
      this.player2.reset();

    this.startGame();
  }

  startGame() {
    this.round = 1;
    this.secondAnswerTimeout = null;
    this.generateNumbers();
  }

  toJSON() {
    const code = this.code;
    const gameOver = this.gameOver;
    const nums = this.nums;
    const player1 = this.player1;
    const player2 = this.player2;
    const round = this.round;
    const rounds = this.rounds;
    return {code, gameOver, nums, player1, player2, round, rounds }
  }

  // Given a code and an array of rooms, find the room if it exists, returns
  // null otherwise
  static findRoom(roomArray, code) {
    if (roomArray == null || code == null) {
      return null;
    }

    for (let i = 0; i < roomArray.length; i++) {
      if (roomArray[i].code == code.toUpperCase()) {
        return roomArray[i];
      }
    }
    return null;
  }

  // Given a code and an array of rooms, delete the room if it exists.
  static deleteRoom(roomArray, code) {
    if (roomArray == null || code == null) {
      return;
    }

    for (let i = 0; i < roomArray.length; i++) {
      if (roomArray[i].code == code.toUpperCase()) {
        roomArray.splice(i, 1); // remove 1 item at index i
      }
    }
  }
}

module.exports = Room;