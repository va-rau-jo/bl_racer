"use strict";
let extend = require("extend");
const utils = require("./utils");

const CODE_LENGTH = 1;
const FIRST_SCORE = 10;
const SECOND_SCORE = 5;
const ROUNDS = 7;

// Declare the constructor and member properties.
class Room {
  constructor(host) {
    this.generateCode();
    this.gameOver = false;
    this.player1 = host;
    this.player2 = null;
    this.nums = null;
    this.round = 0;
    // TODO: toggle for number of rounds
    this.rounds = ROUNDS;
    this.secondAnswerTimeout = null;
  }

  // Define static members directly on the Constructor function.
  addPlayer(player) {
    if (this.player2 === null)
      this.player2 = player;
    else
      console.log("Cannot add another player");
    return null;
  }

  advanceRound() {
    console.log("advancing to next round soon...")
    if (this.round === this.rounds) {
       setTimeout(() => {
        this.round++;
        this.gameOver = true;
        console.log("GAME OVER");
       }, 5000);
    } else {
      setTimeout(() => {
        this.round++;
        this.player1.answer = null;
        this.player1.correct = false;

        this.player2.answer = null;
        this.player2.correct = false;

        this.generateNumbers();
        console.log("Now on round " + this.round);
      }, 5000);
    }
  }

  checkAnswer(answer, isHost) {
    let correct = utils.checkAnswer(answer, this.nums);

    if (correct) {
      let player = isHost ? this.player1 : this.player2;
      let opponent = !isHost ? this.player1 : this.player2;
      let score = opponent.correct ? SECOND_SCORE : FIRST_SCORE;
      player.answer = answer;
      player.correct = true;
      player.score += score;
      player.scores.push(score);

      if (opponent.correct) { // you were second answer, clear timer
        clearTimeout(this.secondAnswerTimeout);
        this.advanceRound();
      } else { // start timer
        console.log(opponent.name + " has 5 seconds to answer");
        this.secondAnswerTimeout = setTimeout(() => {
          opponent.scores.push(0);
          this.advanceRound();
        }, 5000)
      }
    }
    return correct;
  }

  // Sets this.code to a random CODE_LENGTH size string of letters
  generateCode() {
    let result = [];
    let characters = 'A' // ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let n = characters.length;
    for (let i = 0; i < CODE_LENGTH; i++) {
      result.push(characters.charAt(Math.floor(Math.random() * n)));
    }
    this.code = result.join('');
  }

  generateNumbers() {
    this.nums = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];

    console.log("numbers are: " + this.nums[0] + " " + this.nums[1] + " " +
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
}

module.exports = Room;