"use client";
import React from "react";

interface MusicToggleProps {
  on: boolean;
  onToggle: () => void;
}

export function MusicToggle({ on, onToggle }: MusicToggleProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "absolute", top: 12, right: 12,
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,126,182,0.4)",
        borderRadius: 8,
        color: on ? "#ff7eb6" : "#666",
        fontSize: 18,
        width: 36, height: 36,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
        zIndex: 20,
      }}
      aria-label={on ? "Mute music" : "Unmute music"}
    >
      {on ? "♪" : "♩"}
    </button>
  );
}
