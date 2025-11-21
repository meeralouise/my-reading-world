import React, { useState, useEffect, useRef, useCallback } from "react";
import Draggable from "react-draggable";

export default function Sticker({ sticker, onDragEnd, onScaleChange }) {
  const [scale, setScale] = useState(Number(sticker.scale) || 1);
  const [locked, setLocked] = useState(!!sticker.locked);
  const [localPos, setLocalPos] = useState({
    x: Number(sticker.x_position) || 0,
    y: Number(sticker.y_position) || 0,
  });
  const [hovered, setHovered] = useState(false);

  const nodeRef = useRef(null);

  // 🧠 Keep state in sync when refreshed
  useEffect(() => {
    setScale(Number(sticker.scale) || 1);
    setLocked(!!sticker.locked);
    setLocalPos({
      x: Number(sticker.x_position) || 0,
      y: Number(sticker.y_position) || 0,
    });
  }, [sticker.x_position, sticker.y_position, sticker.scale, sticker.locked]);

  const updateSticker = useCallback(async (updates) => {
    try {
      await fetch(`/api/stickers/${sticker.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to update sticker:", err);
    }
  }, [sticker.id]);

  // ✅ Working scale change logic
  const handleScale = useCallback(
    (newScale) => {
      const clamped = Math.max(0.5, Math.min(newScale, 3)); // reasonable limits
      console.log("Scaling sticker", sticker.id, "to", clamped);

      // Immediately update UI
      setScale(clamped);

      // Persist to DB
      updateSticker({ scale: clamped });

      // Notify parent
      if (typeof onScaleChange === "function") onScaleChange(sticker.id, clamped);
    },
    [sticker.id, onScaleChange, updateSticker]
  );

  const handleLockToggle = () => {
    const next = !locked;
    setLocked(next);
    updateSticker({ locked: next });
  };

  const handleStop = (e, data) => {
    const { x, y } = data;
    setLocalPos({ x, y });
    onDragEnd(sticker.id, x, y);
  };

  // Flip popup down if too close to top
  const flipPopupDown = localPos.y < 120;

  return (
    <Draggable
      nodeRef={nodeRef}
      disabled={locked}
      position={localPos}
      onDrag={(e, data) => setLocalPos({ x: data.x, y: data.y })}
      onStop={handleStop}
      bounds="parent"
      cancel=".sticker-controls, .book-info-popup"
    >
      {/* Outer draggable wrapper */}
      <div
        ref={nodeRef}
        className="sticker-wrapper"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "absolute",
          cursor: locked ? "default" : "grab",
          userSelect: "none",
        }}
      >
        {/* Inner scaling wrapper (only image + buttons scale) */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
        >
          <img
            src={sticker.image_url || sticker.imageUrl}
            alt="sticker"
           style={{
  width: "auto",
  height: "auto",
  maxWidth: "180px",
  maxHeight: "180px",
  objectFit: "contain",
  pointerEvents: "none",
}}
          />
  
          {/* Scale + Lock Controls */}
          <div
            className="sticker-controls"
            style={{
              position: "absolute",
              bottom: -32,
              right: 0,
              display: hovered ? "flex" : "none",
              gap: 8,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 6,
              padding: "2px 6px",
              border: "1px solid #ccc",
              zIndex: 10,
            }}
          >
            {!locked && (
              <>
                <button onClick={() => handleScale(scale + 0.1)}>＋</button>
                <button onClick={() => handleScale(scale - 0.1)}>－</button>
              </>
            )}
            <button onClick={handleLockToggle}>{locked ? "🔓" : "🔒"}</button>
          </div>
        </div>
  
        {/* Unscaled book info popup */}
        {hovered && (sticker.title || sticker.author || sticker.reader_name) && (
          <div
            className="book-info-popup"
            style={{
              position: "absolute",
              ...(localPos.y < 120 ? { top: "110%" } : { bottom: "110%" }),
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.98)",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "8px 12px",
              width: 200,
              fontSize: 12,
              boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
              zIndex: 20, // higher than sticker
            }}
          >
            {sticker.title && <strong>{sticker.title}</strong>}
            {sticker.author && (
              <>
                <br />
                <em>{sticker.author}</em>
              </>
            )}
            {sticker.reader_name && (
              <>
                <br />
                {sticker.reader_name}
              </>
            )}
            {sticker.date_read && (
              <>
                <br />
                {sticker.date_read}
              </>
            )}
          </div>
        )}
  
  <style jsx>{`
        .sticker-controls button {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          padding: 2px 6px;
        }
        .sticker-controls button:hover {
          background: #fff;
        }
      `}</style>
    </div>
  </Draggable>
);
}
