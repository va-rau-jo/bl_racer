import './Game.css';
import React from 'react';
import Sidebar from './Sidebar.js'

class Game extends React.Component {

  /**
   * Helper function to create the 5 answer inputs
   * @returns An array with 5 input tags that will automatically advance and
   * backspace as needed.
   */
  genAnswerInputs = (onKeyDown, onKeyUp) => {
    const inputs = [];
    for (let i = 0; i < 5; i++) {
      inputs.push(<input className="game-answer-input" id={"answer" + i}
        onKeyDown={(e) => onKeyDown(e, i)} onKeyUp={(e) => onKeyUp(e, i)}
        type="text" maxLength="1" size="1"/>
      );
    }
    return inputs;
  }

  /**
   * Function to render the main game component that handles the answer,
   * and shows the other player's state.
   */
  gameComponent = (props) => {
    const answerInputs =
      this.genAnswerInputs(props.answerOnKeyDown, props.answerOnKeyUp);

    return (
      <div className="game-container">
        <div>
          <div>
            <p className="game-round-label">
              ROUND: {props.round} / {props.rounds}
            </p>
          </div>
          <div className="game-submain">
            <div className="game-numbers-div">
              <span className="game-number"> {props.nums[0]} </span>
              <span className="game-number"> {props.nums[1]} </span>
              <span className="game-number"> {props.nums[2]} </span>
            </div>
            <div>
              <div>
                {answerInputs[0]}
                {answerInputs[1]}
                {answerInputs[2]}
                {answerInputs[3]}
                {answerInputs[4]}
              </div>
              <button className="menu-button" id="submit-btn" disabled
                onClick={props.submitAnswer}>
                Submit
              </button>
            </div>
          </div>
        </div>
        <div>
          {props.player.correct === true
            ? <p className="correct-msg"> Correct! </p>
            : props.player.correct === false
            ? <p className="incorrect-msg"> Wrong </p>
            : props.opponent.correct === true
            ? <p> {props.opponent.name + " got the answer!" } </p>
            : null}

          {props.countdownTime !== 0
            ? <p className="countdown_timer"> {props.countdownTime} </p>
            : null }
        </div>
      </div>
    );
  }


  /**
   * Function to render the component after a game ends, including returning
   * back to the home page and handling rematches.
   */
  gameOverComponent = (props) => {
    let win = props.player.score > props.opponent.score;
    return (
      <>
        <p className="game-over-title">
          { win ? "You win!" : "You lose..." }
        </p>

        <div className="game-final-div">
          <button className="game-final-btn"
            onClick={() => {props.returnHome(false)}}>
            Home
          </button>
          <button className="game-final-btn" disabled={props.player.rematch}
            onClick={props.rematch}>
            Rematch?
          </button>

          {props.opponent.rematch ?
            <p> {props.opponent.name} wants a rematch! </p> :
            props.player.rematch ?
            <p> You offered a rematch! </p> :
              null}
        </div>
      </>
    );
   }

  /**
   * Function to render the component that waits for the player to ready up
   * and displays the other player's ready status
   */
  readyComponent = (props) => {
    return (
      <div className="ready-main">
        <button className="menu-button" onClick={props.readyUp}>
          {props.player.ready ? "Cancel" : "Ready!"}
        </button>
        <div>
          <span className="ready-checkbox-label" > {props.opponent.name} ready:
          </span>
          <input className="ready-checkbox" type="checkbox" disabled
            checked={props.opponent.ready} />
        </div>
      </div>
    );
  }

  /**
   * Function to render the component that is waiting for a player to join.
   */
  waitingComponent = (props) => {
    return (
      <div className="waiting-main">
        <p className="waiting-label"> Waiting for a player to join </p>
        <img src="/images/loading.gif" alt="loading" />
      </div>
    );
  }

  render() {
    const props = this.props;
    const isAwaitingOpponent = props.opponent === null;
    const isAwaitingReady = props.round === 0;
    const isGameOver = props.gameOver;

    return (
      <main>
        <section className="sidebar-main">
          <Sidebar
            opponent={props.opponent}
            player={props.player}
            returnHome={props.returnHome}
            roomCode={props.roomCode}
            round={props.round}
            rounds={props.rounds}
          />
        </section>
        <section className="game-main">
          {isAwaitingOpponent
            ? this.waitingComponent(props)
            : (isAwaitingReady
              ? this.readyComponent(props)
              : (isGameOver
                  ? this.gameOverComponent(props)
                  : this.gameComponent(props)))
          }
        </section>
      </main>
    )
  }
}

export default Game;
