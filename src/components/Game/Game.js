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
      <>
        <div>
          <p className="game-round-label">
            ROUND: {props.round} / {props.rounds}
          </p>
        </div>
        <div className="game-submain">
          <div className="game-numbers-div">
            {/* <p> p1 answer: {props.player.answer} </p>
            <p> correct: {props.player.correct ? "True" : "FAlse"} </p>
            <p> p2 answer: {props.opponent.answer} </p>
            <p> correct: {props.opponent.correct ? "True" : "FAlse"} </p> */}

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
              {/* <input className="game-answer-input" id="answer0" type="text"
                onKeyUp={(e) => props.updateAnswer(e, 0)} />
              <input className="game-answer-input" id="answer1" type="text"
                onKeyUp={(e) => props.updateAnswer(e, 1)} />
              <input className="game-answer-input" id="answer2" type="text"
                onKeyUp={(e) => props.updateAnswer(e, 2)} />
              <input className="game-answer-input" id="answer3" type="text"
                onKeyUp={(e) => props.updateAnswer(e, 3)} />
              <input className="game-answer-input" id="answer4" type="text"
                onKeyUp={(e) => props.updateAnswer(e, 4)} /> */}
            </div>
            <button onClick={props.submitAnswer}> Submit </button>
          </div>
        </div>
      </>
    );
  }

   gameOverComponent = (props) => {
    return (
      <>
        <p> Game over! </p>

        <p> p1 score: {props.player.score} </p>
        <p> p2 score: {props.opponent.score} </p>
        <button onClick={props.rematch}> Rematch? </button>
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
          {props.ready ? "Cancel" : "Ready!"}
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
        <img src="/loading.gif" alt="loading" />
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
