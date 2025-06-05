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

  // Update coin positions on screen (ตำแหน่งกระเป๋าและเหรียญ)
  const updateVisible = (offsetX) => {
    const wrapper = containerRef.current;
    if (!wrapper) return;

    const itemElem = wrapper.querySelector(`.${styles.luggageItem}`);
    const itemWidth = itemElem?.offsetWidth || 150;
    const gap = 60;
    const totalWidth = (itemWidth + gap) * baseBags.length;
    const containerWidth = wrapper.offsetWidth;

    const coinWidth = 100;
    const center = containerWidth / 2;
    const scan = containerWidth * 0.15;
    const start = center - scan / 2;
    const end = center + scan / 2;

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
        left,
        coinLeft: left + (250 / 2) - (coinWidth / 2) + 45,
        visible,
      };
    });

    setCoinPositions(newPositions);
    if (onCoinUpdate) onCoinUpdate(newPositions);
  };

  // หา index เป้าหมายเหรียญที่อยู่ใกล้กลางที่สุดและตรงกับ reward
  const getTargetIndex = () => {
    const wrapper = containerRef.current;
    if (!wrapper) return 0;

    const itemElem = wrapper.querySelector(`.${styles.luggageItem}`);
    const itemWidth = itemElem?.offsetWidth || 150;
    const gap = 60;

    const type = matchRewardCoin(rewardCoin);
    const centerX = wrapper.getBoundingClientRect().width / 2;

    let minDiff = Infinity;
    let targetIdx = 0;

    coinPositions.forEach((bag, i) => {
      const bagCenter = bag.left + itemWidth / 2;
      const diff = Math.abs(bagCenter - centerX);
      if (getCoinType(bag.coin) === type && diff < minDiff) {
        minDiff = diff;
        targetIdx = i;
      }
    });

    return targetIdx;
  };

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;

    const itemElem = wrapper.querySelector(`.${styles.luggageItem}`);
    const itemWidth = itemElem?.offsetWidth || 150;
    const gap = 60;
    const totalWidth = (itemWidth + gap) * baseBags.length;

    const animate = () => {
      let offset = currentOffsetRef.current + speedRef.current;
      if (offset >= totalWidth) offset -= totalWidth;

      if (stopCoin && !isStopping) setIsStopping(true);

      if (isStopping) {
        const targetIdx = getTargetIndex();

        // คำนวณตำแหน่งเป้าหมายจริงแบบแม่นยำด้วย DOM
        const targetX = (itemWidth + gap) * targetIdx;

        // คำนวณ centerOffset โดยใช้ขนาดจริงของ container
        const wrapperRect = wrapper.getBoundingClientRect();
        const centerOffset = offset + wrapperRect.width / 2 - itemWidth / 2;

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
  }, [stopCoin, rewardCoin, isStopping, coinPositions]); // เพิ่ม coinPositions เพื่อให้ getTargetIndex ใช้ข้อมูลล่าสุด

  // อัพเดตตำแหน่งเมื่อหน้าจอเปลี่ยนขนาด
  useEffect(() => {
    const onResize = () => {
      updateVisible(currentOffsetRef.current);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
