import './Game.css';

function Sidebar(props) {
  const isAwaitingOpponent = props.opponent === null;
  const gameStarted = props.round > 0;

  return (
    <>
      <p className="room-code-label"> Code:
        <span className="room-code"> {props.roomCode} </span>
      </p>
      <p className="rounds-label"> Rounds:
        <span className="rounds"> {props.rounds} </span>
      </p>
      <hr className="sidebar-hr" />
      <div className="sidebar-players">
        <div>
          <p className="sidebar-name"> {props.player.name} (you) </p>
          {gameStarted ?
            <>
              <p className="sidebar-score"> {props.player.score} </p>
              <ul className="sidebar-scores">
                { props.player.scores.map(function(score, i){
                    const color = score === 10
                      ? "score-item-green"
                      : score === 5
                        ? "score-item-yellow"
                        : "score-item-red";
                    return (
                      <li className={color} key={i}>
                        {score}
                       </li>
                    )
                  })
                }
              </ul>
            </> : <></>
          }
        </div>
        <div>
           <p className="sidebar-name">
            {isAwaitingOpponent ? "Waiting for Opponent" : props.opponent.name}
          </p>
          {gameStarted ?
            <>
              <p className="sidebar-score"> {props.opponent.score} </p>
              <ul className="sidebar-scores">
                { props.opponent.scores.map(function(score, i){
                    const color = score === 10
                      ? "score-item-green"
                      : score === 5
                        ? "score-item-yellow"
                        : "score-item-red";
                    return (
                      <li className={color} key={i}>
                        {score}
                       </li>
                    )
                  })
                }
              </ul>
            </> : <></>
          }
        </div>
      </div>
    </>
  )
}

export default Sidebar;