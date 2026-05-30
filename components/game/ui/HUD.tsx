"use client";
import React from "react";

interface HUDProps {
  hearts: number;
  worldName: string;
  worldId: number;
  totalWorlds: number;
  heartMessage: string | null;
  musicOn: boolean;
}

export function HUD({ hearts, worldName, worldId, totalWorlds, heartMessage, musicOn }: HUDProps) {
  return (
    <>
      {/* Top bar */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 16px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)",
          pointerEvents: "none",
        }}
      >
        {/* Hearts */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18, filter: "drop-shadow(0 0 4px #ff7eb6)" }}>♡</span>
          <span className="font-pixel" style={{ color: "#ff7eb6", fontSize: 10 }}>
            {hearts}
          </span>
        </div>

        {/* World name */}
        <div className="font-pixel" style={{ color: "#ffd5ee", fontSize: 8, textAlign: "center" }}>
          {worldName}
        </div>

        {/* World progress dots */}
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: totalWorlds }, (_, i) => (
            <div
              key={i}
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: i < worldId ? "#ff7eb6" : i === worldId - 1 ? "#fff" : "rgba(255,255,255,0.25)",
                boxShadow: i === worldId - 1 ? "0 0 6px #ff7eb6" : "none",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating heart message */}
      {heartMessage && (
        <div
          key={heartMessage + Date.now()}
          className="anim-pop-in"
          style={{
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.7)",
            border: "1px solid #ff7eb6",
            borderRadius: 10,
            padding: "8px 18px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <span className="font-pixel" style={{ color: "#ff7eb6", fontSize: 7 }}>
            {heartMessage}
          </span>
        </div>
      )}
    </>
  );
}