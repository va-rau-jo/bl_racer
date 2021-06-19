import './App.css';
import React from 'react';
import Game from './components/Game/Game';
import Menu from './components/Menu/Menu';
const utils = require('./utils/utils');

// Server URL for our API calls
const SERVER = window.location.href.includes("localhost")
  ? "http://localhost:8888/"
  : "TODO: deployed url";

class App extends React.Component {
    constructor(props) {
    super(props);
    this.state = {
      countdownTime: 0,
      host: false,
      joinCode: null,
      muted: false,
      nums: [],
      opponent: null,
      player: { name: "Player"},
      ready: false,
      roomCode: null,
      round: 0,
      rounds: 0,
    };
  }

  handleWindowClose(){
    alert("Alerted Browser Close");
  }

  componentDidMount = () => {
    window.addEventListener("beforeunload", (ev) => {
      if (this.state.roomCode !== null)  {
        ev.preventDefault();
        this.leaveRoom();
        return ev.returnValue = "Closing";
      }
    });
  }

  componentWillUnmount = () => {
    window.removeEventListener('beforeunload', this.handleWindowClose);
  }

  /**
   * Called when the server has a higher round number than before. Resets the
   * answer inputs and starts the countdown for the round.
   */
  advanceRound = (room) => {
    utils.log("advanced round, starting in 3")
    for (let i = 0; i < 5; i++) {
      const input = this.id("answer" + i);
      if (input) {
        input.value = "";

        if (i === 0)
          input.focus();
      }
    }

    this.playSound('countdown.wav');
    this.setState({
      countdownTime: utils.START_ROUND_WAIT_TIME,
      countdownTimer: setInterval(this.numbersCountdown, 1000, room)
    });
  }

  /**
   * Only numbers are allowed at indices 0, 2, 4 and only the operation keys
   * are allowed at indices 1, 3.
   * @param {object} event Event object, containing the key pressed.
   * @param {number} index The number index the user typed into.
   */
  answerOnKeyDown = (event, index) => {
    if ((index % 2 === 0 && !utils.ALLOWED_NUMS.includes(event.key)) ||
        (index % 2 === 1 && !utils.ALLOWED_OPS.includes(event.key)))
      event.preventDefault();
  }

  /**
   * Backspace removes the last character typed, moving inputs if necessary.
   * Enter submits the answer if on the last input. If a character is typed, the
   * next input is selected.
   * @param {object} event The event object, containing the key pressed
   * @param {number} index The index of input typed into.
   */
  answerOnKeyUp = (event, index) => {
    if (event.key === "Backspace" && event.target.value !== "") {
      const input = this.id("answer" + index);
      input.value = "";
    } else if (event.key === "Backspace" && event.target.value === "" && index !== 0) {
      const prev = this.id("answer" + (index - 1));
      prev.focus();
      prev.value = "";
    } else if (event.key === "Enter" && event.target.value !== "" && index === 4) {
      if (!this.id("submit-btn").disabled)
        this.submitAnswer();
    } else if (event.target.value !== "") {
      if (index !== 4)
        this.id("answer" + (index + 1)).focus();
    }
  }

  /**
   * Updates the state to store the join code currently typed.
   * @param {object} event The event object containing the code.
   */
  changeJoinCode = (event) => {
    this.setState({joinCode: event.target.value.toUpperCase()});
  }

  /**
   * Updates the state to store the current name typed.
   * @param {object} event The event object containing the name.
   */
  changeName = (event) => {
    this.setState({player: {"name": event.target.value}});
  }

  /**
   * Create a new room with a random code that is returned by the server. Starts
   * an interval to await for new players to join.
   */
  createRoom = () => {
    let rounds = this.id("roundInput").value;
    utils.log(rounds)
    this.serverGET('create', [['name', this.state.player.name], ["rounds", rounds]])
      .then(res => res.json())
      .then(this.jsonCheck)
      .then((json) => {
        this.setState({host: true,
          roomCode: json.message.code,
          rounds: json.message.rounds
        });
        this.startOpponentFetch();
      });
    }

  handleGameStatus = (json) => {
    json = json.message;
    if (json.success) {
      let room = json.room;
      let player = this.state.host ? room.player1 : room.player2;
      let opponent = !this.state.host ? room.player1 : room.player2;

      // Update player and opponent object.
      let opponentCorrect = this.state.opponent.correct;
      this.setState({
        gameOver: room.gameOver,
        opponent: opponent,
        player: player
      });

      // Player got the answer right during the second chance countdown
      if (this.state.player.correct && this.state.opponent.correct && this.state.countdownTimer !== null) {
        clearInterval(this.state.countdownTimer);
        this.setState({
          countdownTime: 0,
          countdownTimer: null,
        });
      }

      // Opponent just got the answer right and the player has not
      if (!this.state.player.correct && this.state.opponent.correct && !opponentCorrect) {
        this.setState({
          countdownTime: utils.SECOND_CHANCE_TIMEOUT,
          countdownTimer: setInterval(this.secondChanceCountdown, 1000)
        });
      }

      // Round has advanced
      if (room.round !== this.state.round) {
        this.setState({
          ready: player.ready,
          round: room.round}
        );
        if (room.round > 0 && !this.state.gameOver)
          this.advanceRound(room);
        else if (this.state.gameOver) {
          this.setState({nums: []});
        }
      }
    } else {
      this.resetState(true);
    }
  }

  /**
   * Join a room with the given code, sets roomCode to joinCode if successful
   */
  joinRoom = () => {
    this.serverGET('join', [['name', this.state.player.name],
                             ['code', this.state.joinCode]])
      .then(res => res.json())
      .then(this.jsonCheck)
      .then((json) => {
        if (json.message.success) {
          utils.log("joined room " + this.state.joinCode);
          this.setState({
            opponent: json.message.opponent,
            roomCode: this.state.joinCode,
            rounds: json.message.rounds,
          });
          this.startGameStatusFetch();
        } else {
          utils.log("could not join room " + this.state.joinCode);
        }
      });
  }

  /**
   * Leave the current room which resets most of the state.
   */
  leaveRoom = () => {
    clearInterval(this.state.gameStatusInterval);

    this.serverPOST('leave', [['host', this.state.host],
                             ['code', this.state.roomCode]])
      .then(res => res.json())
      .then(this.jsonCheck)
      .then((json) => {
        if (json.message.success) {
          this.resetState();
        } else {
          utils.log("Could not read json message");
        }
    });
  }

  /**
   * Function called on interval before starting the room. Once completed, it
   * reveals the numbers for the round.
   * @param {JSON} room A json object containg the numbers.
   */
  numbersCountdown = (room) => {
    if (this.state.countdownTime > 1) {
      this.setState({countdownTime: this.state.countdownTime - 1});
    } else {
      clearInterval(this.state.countdownTimer);
      this.id("submit-btn").disabled = false;
      this.setState({
        countdownTime: 0,
        countdownTimer: null,
        nums: room.nums
      });
    }
  }

  /**
   * Function to play a sound. Doesn't play a sound if the mute option has been
   * enabled.
   * @param {string} name The name of the sound to play (with the extension)
   */
  playSound = (name) => {
    if (!this.state.muted) {
      let audio = new Audio(name);
      audio.volume = 0.5;
      audio.play();
    }
  }

  /**
   * Function to declare to the server that this player is ready to start.
   */
  readyUp = () => {
    this.setState({ready: !this.state.ready});
    this.serverPOST('ready', [['host', this.state.host],
                             ['code', this.state.roomCode]])
      .then(res => res.json())
      .then(this.jsonCheck)
      .then((json) => {
        if (json.message.success) {
          utils.log("ready successful");
        } else {
          utils.log("Could not read json message");
        }
      });
  }

  /**
   * Sends a request to the server for a rematch, if the other player requests
   * a rematch also, the game will restart.
   */
  requestRematch = () => {
    this.serverPOST('rematch', [['host', this.state.host],
                             ['code', this.state.roomCode]]);
  }

  resetState = (displayMessage) => {
    clearInterval(this.state.gameStatusInterval);

    if (this.state.roomCode !== null)
      this.leaveRoom();
      this.setState({
        host: false,
        joinCode: null,
        opponent: null,
        nums: [],
        ready: false,
        roomCode: null,
        round: 0,
      });

    if (displayMessage) {
      alert("Something went wrong.");
    }
  }

  /**
   * OnChange function to update the label of the round selector with the
   * current value.
   */
  roundInputChange = () => {
    var slider = this.id("roundInput");
    var label = this.id("roundsLabel");
    label.innerHTML = "Rounds: " + slider.value;
  }

  /**
   * Function called on interval after the opponent gets an answer right. Player
   * has SECOND_CHANCE_TIMEOUT time to submit an answer for half points.
   * @param {JSON} room A json object containg the numbers.
   */
  secondChanceCountdown = (room) => {
    if (this.state.countdownTime > 1) {
      this.setState({countdownTime: this.state.countdownTime - 1});
    } else {
      clearInterval(this.state.countdownTimer);
      this.id("submit-btn").disabled = true;
      this.setState({
        countdownTime: 0,
        countdownTimer: null
      });
    }
  }

  /**
   * Wrapper function for fetch() that takes in the server path and any
   * necessary query arguments
   * @param path The server path "/create" or "/join"
   * @param args Any query arguments after path "abcd" in "/join?code:abcd"
   * @returns A promise that .then() can be called on
   */
  serverGET = (path, args) => {
    if (args == null) {
      return fetch(SERVER + path);
    }

    let argString = '?';
    for (let i = 0; i < args.length; i++) {
      if (i > 0)
        argString += '&';

      argString += args[i][0] + '=' + args[i][1];
    };
    return fetch(SERVER + path + argString);
  }

  serverPOST = (path, args) => {
    let json = {};
    for (let i = 0; i < args.length; i++) {
      json[args[i][0]] = args[i][1];
    };

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json),
    };
    return fetch(SERVER + path, requestOptions);
  }

  /**
   * Sets an interval to ping the server for game information
   */
  startGameStatusFetch() {
    this.setState({
      gameStatusInterval:
        setInterval(() => {
          this.serverGET('status', [['code', this.state.roomCode]])
            .then(res => res.json())
            .then(this.jsonCheck)
            .then(this.handleGameStatus)
      }, utils.FETCH_GAME_STATUS_INTERVAL)
    });
  }

  /**
   * Sets an interval to ping the server whether an opponent has joined.
   */
  startOpponentFetch() {
    this.setState({
      opponentInterval:
        setInterval(() => {
          this.serverGET('getOpponent', [['code', this.state.roomCode]])
            .then(res => res.json())
            .then(this.jsonCheck)
            .then((json) => {
              json = json.message;
              if (json.success && json.opponent !== null) {
                utils.log("player " + json.opponent.name + " joined!");
                clearInterval(this.state.opponentInterval);
                this.setState({
                  opponent: json.opponent,
                  opponentInterval: null
                });
                this.startGameStatusFetch();
              } else if (!json.success) {
                utils.log("Used wrong room code? Something went wrong.");
              }
            });
      }, utils.FETCH_OPPONENT_STATUS_INTERVAL)
    });
  }

  submitAnswer = () => {
    let answer = []
    for (let i = 0; i < 5; i++) {
      answer.push(this.id("answer" + i).value);
    }

    this.serverPOST('submit', [['host', this.state.host],
                               ['code', this.state.roomCode],
                               ['answer', answer]])
      .then(res => res.json())
      .then(this.jsonCheck)
      .then((json) => {
        if (json.message.success) {
          if (json.message.correct) {
            this.playSound('correct.mp3');
            this.id("submit-btn").disabled = true;
          }
        } else {
          utils.log("Could not read json message");
        }
      });
  }

  toggleSound = () => {
    utils.log(this.state.muted)
    this.setState({muted: !this.state.muted}, () => {
      this.id("sound-btn").src = this.state.muted
        ? "/images/muted.png" : "/images/sound.png";
    });
  }

  // ---- STRICTLY HELPER FUNCTIONS ---- //

  /**
   * Function to shorten document.getElementById to id.
   * @param {string} name The id of the element to get.
   * @returns {Element} Returns a DOM element.
   */
  id = (name) => {
    return document.getElementById(name);
  }

  /**
   * Helper function to make sure a json response is actually JSON.
   * @param {JSON} json The json response.
   * @returns {JSON} Returns the json if it is formatted correctly.
   */
  jsonCheck = (json) => {
    if (!json) {
      utils.log("Could not read json message");
    }
    return json;
  }

  print = () => {
    this.serverGET('print', [['code', this.state.roomCode]])
      .then(res => res.json())
      .then(() => { utils.log("printed in console")});
  }

  printrooms = () => {
    this.serverGET('printrooms')
      .then(res => res.json())
      .then(() => { utils.log("printed in console")});
  }

  printstate = () => {
    utils.log(this.state);
  }

  render() {
    let inRoom = this.state !== undefined && this.state.roomCode !== null;
    return (
      <div className="App">
        {utils.DEBUG_MODE ?
          <>
            <button onClick={this.printstate}> print state </button>
            <button onClick={this.print}> print room </button>
            <button onClick={this.printrooms}> print rooms</button>
          </> : null
        }
        <img id="sound-btn" onClick={this.toggleSound} alt="sound-toggle"
          src="/images/sound.png" />

        {!inRoom
          ? <Menu
              changeJoinCode={this.changeJoinCode}
              changeName={this.changeName}
              createRoom={this.createRoom}
              joinCode={this.state.joinCode}
              joinRoom={this.joinRoom}
              name={this.state.player.name}
              roundInputChange={this.roundInputChange} />
          : <Game
              answerOnKeyDown={this.answerOnKeyDown}
              answerOnKeyUp={this.answerOnKeyUp}
              countdownTime={this.state.countdownTime}
              gameOver={this.state.gameOver}
              nums={this.state.nums}
              opponent={this.state.opponent}
              player={this.state.player}
              readyUp={this.readyUp}
              rematch={this.requestRematch}
              returnHome={this.resetState}
              roomCode={this.state.roomCode}
              round={this.state.round}
              rounds={this.state.rounds}
              submitAnswer={this.submitAnswer} />
        }
      </div>
    );
  }
}

export default App;
