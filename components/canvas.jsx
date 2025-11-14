import { useState, useEffect } from "react";
import Sticker from "./sticker";

import { STICKER_LIBRARY } from "../lib/stickerLibrary.js";


export default function Canvas() {
  const [isClient, setIsClient] = useState(false);
  const [stickers, setStickers] = useState([]);
  const [bookInfo, setBookInfo] = useState({
    title: "",
    author: "",
    name: "",
    date: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(
    STICKER_LIBRARY[0]?.url || ""
  );
  
  

  useEffect(() =>{ 
  setIsClient(true);
 }, []);

  // 🧠 Load stickers from DB
  useEffect(() => {
    if (!isClient) return;
    const fetchStickers = async () => {
      try {
        const res = await fetch("/api/stickers");
        const data = await res.json();
        if (Array.isArray(data)) {
          console.log("📥 Stickers loaded from DB:", data);
          setStickers(data);
        } else {
          console.error("Expected array from /api/stickers:", data);
        }
      } catch (err) {
        console.error("Failed to fetch stickers:", err);
      }
    };
    fetchStickers();
  }, [isClient]);

  if (!isClient) return null;

  // 🟢 Handle dragging
  const handleDragEnd = async (id, x, y) => {
    console.log("🟢 Drag ended for sticker:", id, "New position:", x, y);
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x_position: x, y_position: y } : s))
    );

    try {
      const res = await fetch(`/api/stickers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x_position: x, y_position: y }),
      });
      console.log("📡 PUT request sent for sticker:", id, "Status:", res.status);
      const updated = await res.json();
      console.log("💾 Server response:", updated);
    } catch (err) {
      console.error("Failed to update sticker position:", err);
    }
  };

  // 🧩 Handle scaling persistence
  const handleScaleChange = async (id, scale) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, scale } : s)));
    try {
      await fetch(`/api/stickers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scale }),
      });
    } catch (err) {
      console.error("Failed to persist sticker scale:", err);
    }
  };

  // 🪶 Handle new sticker creation
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const { title, author, name, date } = bookInfo;

    if (title && author && name && date) {
      const newSticker = {
        x_position: Math.floor(Math.random() * 800 + 100),
        y_position: Math.floor(Math.random() * 800 + 100),
        image_url: selectedSticker,
        scale: 1,
        locked: false,
       
        title: bookInfo.title,
        author: bookInfo.author,
        reader_name: bookInfo.name,
        date_read: bookInfo.date,


      };

      try {
        const res = await fetch("/api/stickers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSticker),
        });

        if (!res.ok) throw new Error(`Failed to add sticker: ${res.statusText}`);

        const savedSticker = await res.json();
        console.log("💾 New sticker saved:", savedSticker);
        setStickers((prev) => [...prev, savedSticker]);
        setFormSubmitted(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      
     {/* Header + Instructions */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    padding: "0 40px",
  }}
>
  {/* Title */}
  <h1
    style={{
      display: "inline-block",
      padding: "12px 40px",
      fontFamily: "sans-serif",
      fontSize: "36px",
      borderRadius: "999px",
      border: "3px dashed #9CC69B",
      background: "#f7fdf7",
    }}
  >
    Our Reading World!
  </h1>

  {/* Instructions */}
  <div
    style={{
      fontSize: "14px",
      marginTop: "1rem",
      maxWidth: "260px",
      lineHeight: "1.4",
      textAlign: "right",
      padding: "1rem",
      borderRadius: "12px",
      background: "#f9f9f9",
      border: "1px dashed #ddd",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      fontFamily: "sans-serif",
    }}
  >
    <strong>How it works:</strong>
    <br />
    Log a book you’ve read →
    earn and choose your sticker →
    place it anywhere in our town!
  </div>
</div>


      {!formSubmitted && (
        <form onSubmit={handleBookSubmit} style={{ marginBottom: "40px" }}>
          <input
            type="text"
            placeholder="Book Title"
            value={bookInfo.title}
            onChange={(e) => setBookInfo({ ...bookInfo, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={bookInfo.author}
            onChange={(e) => setBookInfo({ ...bookInfo, author: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Your Name"
            value={bookInfo.name}
            onChange={(e) => setBookInfo({ ...bookInfo, name: e.target.value })}
            required
          />
          <input
            type="date"
            value={bookInfo.date}
            onChange={(e) => setBookInfo({ ...bookInfo, date: e.target.value })}
            required
          />
          <div style={{ 
            marginTop: "10px", 
            fontFamily: "sans-serif", }}>
            <label>Select a sticker: </label>
            <select
              value={selectedSticker}
              onChange={(e) => setSelectedSticker(e.target.value)}
            >
             {STICKER_LIBRARY.map((s) => (
  <option key={s.name} value={s.url}>
    {s.name}
  </option>
))}
            </select>
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>
            Submit & Earn Sticker
          </button>
        </form>
      )}

      <div
        style={{
          width: "2000px",
          height: "2000px",
          border: "1px solid #ccc",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {stickers.map((s) => (
          <Sticker
            key={s.id}
            sticker={{
              id: s.id,
              x_position: Number(s.x_position) || 0,
              y_position: Number(s.y_position) || 0,
              scale: Number(s.scale) || 1,
              image_url: s.image_url,
              locked: s.locked,
              title: s.title,
              author: s.author,
              reader_name: s.reader_name,
              date_read: s.date_read,
            }}
            onDragEnd={handleDragEnd}
            onScaleChange={handleScaleChange}
          />
        ))}
      </div>
    </div>
  );
}
