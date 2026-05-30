"use client";
import React from "react";

interface DialogBoxProps {
  text: string;
  onClose?: () => void;
}

export function DialogBox({ text, onClose }: DialogBoxProps) {
  return (
    <div
      className="anim-slide-up"
      style={{
        position: "absolute", bottom: "18%", left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(10,4,30,0.92)",
        border: "1px solid #ff7eb6",
        borderRadius: 12,
        padding: "14px 22px",
        maxWidth: "80%",
        textAlign: "center",
        pointerEvents: onClose ? "auto" : "none",
        cursor: onClose ? "pointer" : "default",
        zIndex: 10,
      }}
      onClick={onClose}
    >
      <p className="font-pixel" style={{ color: "#ffd5ee", fontSize: 7, lineHeight: 2.2 }}>
        {text}
      </p>
      {onClose && (
        <p className="font-pixel" style={{ color: "#ff7eb6", fontSize: 5, marginTop: 8, opacity: 0.7 }}>
          [ tap to continue ]
        </p>
      )}
    </div>
  );
}
