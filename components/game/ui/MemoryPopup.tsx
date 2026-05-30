"use client";
import React from "react";
import { STORY_CONFIG } from "@/config/story";

interface MemoryPopupProps {
  memoryId: string;
  onClose: () => void;
}

export function MemoryPopup({ memoryId, onClose }: MemoryPopupProps) {
  const memory = STORY_CONFIG.memories.find(m => m.id === memoryId);
  if (!memory) return null;

  return (
    <div
      style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 30,
      }}
      onClick={onClose}
    >
      <div
        className="anim-pop-in"
        style={{
          background: "linear-gradient(135deg, #1a0a2e, #2d0a4e)",
          border: "2px solid #ff7eb6",
          borderRadius: 16,
          padding: "28px 32px",
          maxWidth: 360,
          width: "88%",
          textAlign: "center",
          cursor: "pointer",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Star */}
        <div style={{ fontSize: 32, marginBottom: 12 }}>⭐</div>

        {/* Memory unlocked badge */}
        <div className="font-pixel" style={{ color: "#a2d2ff", fontSize: 6, marginBottom: 10, opacity: 0.8 }}>
          MEMORY UNLOCKED
        </div>

        {/* Image placeholder / frame */}
        <div
          style={{
            width: "100%", aspectRatio: "16/9",
            background: "rgba(255,126,182,0.08)",
            border: "1px solid rgba(255,126,182,0.3)",
            borderRadius: 10,
            marginBottom: 16,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={memory.imagePath}
            alt={memory.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          {/* Fallback heart */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, opacity: 0.3,
          }}>
            ♡
          </div>
        </div>

        {/* Title */}
        <div className="font-pixel" style={{ color: "#fff", fontSize: 9, marginBottom: 8 }}>
          {memory.title}
        </div>

        {/* Subtitle */}
        <div className="font-pixel" style={{ color: "#ffd5ee", fontSize: 6, lineHeight: 2, marginBottom: 16 }}>
          {memory.subtitle}
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255,126,182,0.15)",
            border: "1px solid #ff7eb6",
            borderRadius: 8,
            color: "#ff7eb6",
            padding: "8px 20px",
            cursor: "pointer",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
          }}
        >
          ♡ Continue
        </button>
      </div>
    </div>
  );
}