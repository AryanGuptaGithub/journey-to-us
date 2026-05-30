"use client";
import React, { useRef, useCallback } from "react";

interface MobileJoystickProps {
  setJoystick: (x: number, y: number) => void;
  setJump: (down: boolean) => void;
}

export function MobileJoystick({ setJoystick, setJump }: MobileJoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const baseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const MAX_R = 40;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    const rect = joystickRef.current!.getBoundingClientRect();
    baseRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    updateStick(touch.clientX, touch.clientY);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === touchIdRef.current) {
        updateStick(touch.clientX, touch.clientY);
      }
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setJoystick(0, 0);
        if (stickRef.current) {
          stickRef.current.style.transform = "translate(-50%, -50%)";
        }
      }
    }
  }, [setJoystick]);

  const updateStick = (cx: number, cy: number) => {
    const dx = cx - baseRef.current.x;
    const dy = cy - baseRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, MAX_R);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    if (stickRef.current) {
      stickRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    }

    setJoystick(nx / MAX_R, ny / MAX_R);
  };

  return (
    <div
      style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        padding: "0 28px 28px",
        pointerEvents: "none",
      }}
    >
      {/* Left joystick */}
      <div
        ref={joystickRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: 100, height: 100,
          borderRadius: "50%",
          background: "rgba(255,126,182,0.12)",
          border: "2px solid rgba(255,126,182,0.3)",
          position: "relative",
          pointerEvents: "auto",
          touchAction: "none",
        }}
      >
        <div
          ref={stickRef}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 44, height: 44,
            borderRadius: "50%",
            background: "rgba(255,126,182,0.5)",
            border: "2px solid #ff7eb6",
            transform: "translate(-50%, -50%)",
            transition: "transform 0.05s",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Jump button */}
      <button
        onTouchStart={() => setJump(true)}
        onTouchEnd={() => setJump(false)}
        style={{
          width: 70, height: 70,
          borderRadius: "50%",
          background: "rgba(255,126,182,0.2)",
          border: "2px solid rgba(255,126,182,0.6)",
          color: "#ff7eb6",
          fontSize: 24,
          pointerEvents: "auto",
          touchAction: "none",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        ↑
      </button>
    </div>
  );
}
