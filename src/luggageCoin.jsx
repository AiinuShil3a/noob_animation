import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

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
  const stopOffsetRef = useRef(null);

  const baseBags = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const type = i % 3;
      const coinType = type === 0 ? "normal" : type === 1 ? "jar" : "bag";
      return {
        luggage:
          type === 0
            ? Luggage_Green
            : type === 1
            ? Luggage_Yellow
            : Luggage_Sky,
        coin: type === 0 ? Coin : type === 1 ? CoinJar : CoinBag,
        type: coinType,
        key: i,
      };
    });
  }, []);

  const matchRewardCoin = useCallback((reward) => {
    if (reward >= 8) return "bag";
    if (reward >= 6 && reward <= 7) return "jar";
    if (reward >= 1 && reward <= 5) return "normal";
    return null;
  }, []);

  const updateVisible = useCallback(
    (offsetX) => {
      const wrapper = containerRef.current;
      if (!wrapper) return;

      const itemElem = wrapper.querySelector(`.${styles.luggageItem}`);
      const itemWidth = itemElem?.offsetWidth || 150;
      const gap = 60;
      const totalWidth = (itemWidth + gap) * baseBags.length;
      const containerWidth = wrapper.offsetWidth;

      const center = containerWidth / 2;
      const scan = containerWidth * 0.15;
      const start = center - scan / 2;
      const end = center + scan / 2;

      const newPositions = baseBags.map((bag, i) => {
        let left = ((itemWidth + gap) * i - offsetX) % totalWidth;
        if (left < -totalWidth / 2) {
          left += totalWidth;
        } else if (left > totalWidth / 2) {
          left -= totalWidth;
        }

        const centerPos = left + itemWidth - 180;
        const visible = centerPos >= start && centerPos <= end;

        return {
          ...bag,
          left,
          coinLeft: centerPos,
          visible,
        };
      });

      setCoinPositions(newPositions);
      if (onCoinUpdate) onCoinUpdate(newPositions);
    },
    [baseBags, onCoinUpdate]
  );

  const getTargetStopOffset = useCallback(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return null;

    const itemElem = wrapper.querySelector(`.${styles.luggageItem}`);
    const itemWidth = itemElem?.offsetWidth || 150;
    const gap = 60;
    const totalWidth = (itemWidth + gap) * baseBags.length;
    const type = matchRewardCoin(rewardCoin);

    const currentOffset = currentOffsetRef.current;
    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const center = wrapperWidth / 2 - itemWidth / 2;

    const candidates = [];

    baseBags.forEach((bag, i) => {
      if (bag.type !== type) return;

      const itemX = (itemWidth + gap) * i;
      const distance =
        (itemX - center - currentOffset + totalWidth) % totalWidth;
      const offset = (itemX - center + totalWidth) % totalWidth;

      candidates.push({ index: i, offset, distance });
    });

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => a.distance - b.distance);

    const target = candidates[1] || candidates[0]; // ✅ ใช้เป้าหมายลำดับที่ 2

    return target.offset;
  }, [rewardCoin, baseBags, matchRewardCoin]);

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;

    const itemElem = wrapper.querySelector(`.${styles.luggageItem}`);
    const itemWidth = itemElem?.offsetWidth || 150;
    const gap = 60;
    const totalWidth = (itemWidth + gap) * baseBags.length;

    updateVisible(currentOffsetRef.current);

    const animate = () => {
      let offset = currentOffsetRef.current + speedRef.current;
      currentOffsetRef.current = offset; // ปล่อยให้วิ่งไปเรื่อย ๆ

      if (stopCoin && !isStopping) {
        setIsStopping(true);
        stopOffsetRef.current = getTargetStopOffset();
      }

      if (isStopping && stopOffsetRef.current !== null) {
        const distance =
          (stopOffsetRef.current - offset + totalWidth) % totalWidth;

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
