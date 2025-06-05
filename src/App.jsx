import React, { useState, useRef } from "react";
import Luggage from "./luggageCoin";
import styles from "./animation.module.css";
// import ButtonAction from "../animation_button_click/buttonAction";

const App = ({ totalPoints, fetchUserPoints }) => {
  const [rewardCoin, setRewardCoin] = useState(0);
  const [stopCoin, setStopCoin] = useState(false);
  const onLuggageStoppedCallback = useRef(null);
  const [coinPositions, setCoinPositions] = useState([]);
  const handleLuggageStopped = () => {
    if (
      onLuggageStoppedCallback.current &&
      typeof onLuggageStoppedCallback.current === "function"
    ) {
      onLuggageStoppedCallback.current();
      onLuggageStoppedCallback.current = null;
    }
  };

  const handleButtonClick = (points, showModalCallback) => {
    if (points !== undefined) {
      setRewardCoin(points);
    }
    onLuggageStoppedCallback.current = showModalCallback;
    setStopCoin(true);
  };

  const handleCoinUpdate = (positions) => {
    setCoinPositions(positions);
  };

  return (
    <div className={styles.scanArea}>
      <div className={styles.windowGame}>
        <div className={styles.logoGame} />
      </div>
      <div
        className={`${styles.luggageBelt} ${
          stopCoin ? styles.luggageBeltPaused : ""
        }`}
      />
      <div className={styles.scanFrame}>
        <div className={styles.widthCoin}>
          <div className={styles.scanLaser}>
            <div className={styles.coinOverlay}>
              {coinPositions.map((coinData, idx) => (
                <div
                  key={`coin-${idx}`}
                  className={styles.coinAbsolute}
                  style={{
                    left: coinData.coinLeft + "px",
                  }}
                >
                  <img
                    src={coinData.coin.src ?? coinData.coin}
                    // className={styles.imageCoin}
                    width={100}
                    height={100}
                    alt="Coin"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* <div className={styles.buttonPosition}>
          <ButtonAction
            totalPoints={totalPoints}
            onRewardModalClose={handleButtonClick}
          />
        </div> */}
      </div>
      <div id="luggage" name="luggage" className="absolute bottom-0">
        <Luggage
          stopCoin={stopCoin}
          rewardCoin={rewardCoin}
          onStopped={handleLuggageStopped}
          onCoinUpdate={handleCoinUpdate}
        />
      </div>
    </div>
  );
};

export default App;
