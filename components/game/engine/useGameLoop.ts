import { useEffect, useRef } from "react";
 
export function useGameLoop(callback: (dt: number, time: number) => void) {
  const cbRef = useRef(callback);
  cbRef.current = callback;
 
  useEffect(() => {
    let rafId: number;
    let lastTime = 0;
 
    const loop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
      lastTime = timestamp;
      cbRef.current(dt, timestamp);
      rafId = requestAnimationFrame(loop);
    };
 
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
}
 