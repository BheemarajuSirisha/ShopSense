import { useState, useEffect } from 'react';

/**
 * Custom hook to animate numbers smoothly from 0 to target value.
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms (default 1200)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted animated number
 */
export function useCountUp(end, duration = 1200, decimals = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const endVal = Number(end);
    if (isNaN(endVal) || endVal === 0) {
      return;
    }

    let startTimestamp = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo function: 1 - Math.pow(2, -10 * progress)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = easeProgress * endVal;

      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(endVal);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);

  return count.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
