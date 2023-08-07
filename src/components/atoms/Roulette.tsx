import {useRoulette} from "../useRoulette.tsx";
import CursorImage from "../../assets/cursor.png";
import RouletteImage from "../../assets/roulette.png";
import {useSocket} from "../../contexts/socket.tsx";

export function Roulette() {
  const { rotation, selectedOption, isSpinning } = useRoulette();
  const {onRouletteStart, currentSpinner } = useSocket();
  return (
    <div className="Roulette">
      <div>
        <h4 className="Roulette__header">
          {currentSpinner && `${currentSpinner} - ${isSpinning ? 'En cours ...' : selectedOption}`}
        </h4>
        <div className="Roulette__container">
          <img
            src={CursorImage}
            alt="The cursor"
            className="Roulette__cursor"
          />
          <img
            className="Roulette__image"
            src={RouletteImage}
            alt="roulette"
            style={{
              transform: `rotate(${rotation}deg)`
            }}
          />
        </div>
      </div>
      <button
        disabled={isSpinning}
        onClick={onRouletteStart}
        className="Roulette__spin"
      >
        Tourner la roue
      </button>
    </div>
  )
}
