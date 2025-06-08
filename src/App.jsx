import React, { useState, useRef } from "react";
import Luggage from "./luggageCoin";
import styles from "./animation.module.css";

const CoinAnimation = ({
  totalPoints,
  fetchUserPoints,
  setPointAction,
  setFunctionModal,
  setShowModalMain,
  setNextDateClaim,
}) => {
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
      setRewardCoin(8);
    }
    onLuggageStoppedCallback.current = showModalCallback;
    setStopCoin(true);
  };

  const handleCoinUpdate = (positions) => {
    setCoinPositions(positions);
  };

  return (
    <div className={styles.scanArea}>
      <div className={styles.planeArea}>
        <div className={styles.planeFlying} />
      </div>
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
                    width={100}
                    height={100}
                    alt="Coin"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.buttonPosition}>
          {/* <ButtonAction
            totalPoints={totalPoints}
            onRewardModalClose={handleButtonClick}
            setPointAction={setPointAction}
            setFunctionModal={setFunctionModal}
            setShowModalMain={setShowModalMain}
            setNextDateClaim={setNextDateClaim}
          /> */}
          <button totalPoints={9} onClick={handleButtonClick}>
            click
          </button>
        </div>
      </div>
      <div
        id="luggage"
        name="luggage"
        style={{ position: "absolute", bottom: 0 }}
      >
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

export default CoinAnimation;
