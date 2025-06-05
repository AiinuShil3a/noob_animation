import React, { useEffect, useRef, useState } from "react";

import Coin from "./image/Points_Bonus_Points.png";
import CoinJar from "./image/Points_Bonus_Points_Jar.png";
import CoinBag from "./image/Points_Bonus_Points_Bag.png";

import Luggage_Green from "./image/Points_Bonus_Luggage_Green.png";
import Luggage_Yellow from "./image/Points_Bonus_Luggage_Yellow.png";
import Luggage_Sky from "./image/Points_Bonus_Luggage_Sky.png";

import styles from "./animation.module.css";

const CoinAnimation = ({
  stopCoin = false,
  rewardCoin = 0,
  onStopped,
  onCoinUpdate,
}) => {
  const containerRef = useRef(null);
  const animationRef = useRef();
  const [isStopping, setIsStopping] = useState(false);
  const [coinPositions, setCoinPositions] = useState([]);
  const currentOffsetRef = useRef(0);
  const speedRef = useRef(2);
  const hasStoppedRef = useRef(false);

  const baseBags = Array.from({ length: 18 }).map((_, i) => {
    const type = i % 3;
    return {
      luggage:
        type === 0 ? Luggage_Green : type === 1 ? Luggage_Yellow : Luggage_Sky,
      coin: type === 0 ? Coin : type === 1 ? CoinJar : CoinBag,
      key: i,
    };
  });

  const getCoinType = (coin) => {
    if (coin === CoinBag) return "bag";
    if (coin === CoinJar) return "jar";
    return "normal";
  };

  const matchRewardCoin = (reward) => {
    if (reward >= 8) return "bag";
    if (reward >= 6) return "jar";
    if (reward >= 1) return "normal";
    return null;
  };

  const getTargetIndex = () => {
    const type = matchRewardCoin(rewardCoin);
    const centerIndex = Math.round(baseBags.length / 2);
    for (let i = 0; i < baseBags.length; i++) {
      const idx = (centerIndex + i) % baseBags.length;
      if (getCoinType(baseBags[idx].coin) === type) return idx;
    }
    return 0;
  };

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;

    const itemWidth =
      wrapper.querySelector(`.${styles.luggageItem}`)?.offsetWidth || 150;
    const gap = 60;
    const totalWidth = (itemWidth + gap) * baseBags.length;
    const containerWidth = wrapper.offsetWidth;

    const getScanWidth = () => {
      return containerWidth * 0.15;
    };

    const updateVisible = (offsetX) => {
      const center = containerWidth / 2;
      const scan = getScanWidth();
      const start = center - scan / 2;
      const end = center + scan / 2;
      const coinWidth = 100;

      const newPositions = baseBags.map((bag, i) => {
        let left = (itemWidth + gap) * i - offsetX;
        if (left + itemWidth < -50) {
          left += totalWidth;
        } else if (left > containerWidth) {
          left -= totalWidth;
        }
      
        const centerPos = left + itemWidth / 2;
        const visible = centerPos >= start && centerPos <= end;
      
        return {
          ...bag,
          left, // ตำแหน่งกระเป๋าอัปเดตใหม่
          coinLeft: left + (250 / 2) - (coinWidth / 2) + 45,
          visible,
        };
      });      

      setCoinPositions(newPositions);
      if (onCoinUpdate) onCoinUpdate(newPositions);
    };

    const animate = () => {
      let offset = currentOffsetRef.current + speedRef.current;
      if (offset >= totalWidth) offset -= totalWidth;

      if (stopCoin && !isStopping) setIsStopping(true);

      if (isStopping) {
        const targetIdx = getTargetIndex();
        const targetX = (itemWidth + gap) * targetIdx;
        const centerOffset = offset + containerWidth / 2 - itemWidth / 2;
        let distance = targetX - centerOffset;
        if (distance < 0) distance += totalWidth;

        speedRef.current = Math.max(distance / 50, 0.5);

        if (distance <= 1) {
          cancelAnimationFrame(animationRef.current);
          hasStoppedRef.current = true;
          if (onStopped) onStopped();
          return;
        }
      }

      currentOffsetRef.current = offset;
      updateVisible(offset);
      animationRef.current = requestAnimationFrame(animate);
    };

    hasStoppedRef.current = false;
    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [stopCoin, rewardCoin, isStopping]);

  return (
    <div className={styles.luggageWrapper} ref={containerRef}>
      {coinPositions.map((bag, i) => (
        <div
          key={i}
          className={styles.luggageItem}
          style={{
            position: "absolute",
            left: `${bag.left}px`,
            transition: isStopping ? "transform 0.1s linear" : "none",
          }}
        >
          <img
            src={bag.luggage}
            alt="Luggage"
            className={styles.imageLuggage}
          />
        </div>
      ))}
    </div>
  );
};

export default CoinAnimation;
