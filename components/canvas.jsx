import { useState, useEffect } from "react";
import Sticker from "./sticker";
import { STICKER_LIBRARY } from "../lib/stickerLibrary.js";

export default function Canvas() {
  const [hoverSubmit, setHoverSubmit] = useState(false);
  const [hoverExport, setHoverExport] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [stickers, setStickers] = useState([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

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

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;

    const fetchStickers = async () => {
      try {
        const res = await fetch("/api/stickers");
        const data = await res.json();
        if (Array.isArray(data)) {
          setStickers(data);
        }
      } catch (err) {
        console.error("Failed to fetch stickers:", err);
      }
    };

    fetchStickers();
  }, [isClient]);

  if (!isClient) return null;

  /* ---------------------- Dragging + Saving ----------------------- */
  const handleDragEnd = async (id, x, y) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x_position: x, y_position: y } : s))
    );

    try {
      await fetch(`/api/stickers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x_position: x, y_position: y }),
      });
    } catch (err) {}
  };

  const handleScaleChange = async (id, scale) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, scale } : s)));

    try {
      await fetch(`/api/stickers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scale }),
      });
    } catch (err) {}
  };

  /* ---------------------- Submitting a Book ----------------------- */
  const handleBookSubmit = async (e) => {
    e.preventDefault();

    const { title, author, name, date } = bookInfo;

    const newSticker = {
      x_position: Math.floor(Math.random() * 800 + 100),
      y_position: Math.floor(Math.random() * 800 + 100),
      image_url: selectedSticker,
      scale: 1,
      locked: false,
      title,
      author,
      reader_name: name,
      date_read: date,
    };

    try {
      const res = await fetch("/api/stickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSticker),
      });

      const saved = await res.json();
      setStickers((prev) => [...prev, saved]);
      setFormSubmitted(true);
    } catch (err) {}
  };

  /* -------------------------- Export PDF --------------------------- */
  const handleExportPDF = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const element = document.getElementById("art-canvas");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 3 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;

    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(36);
    pdf.text("Our Reading World", pageWidth / 2, 40, { align: "center" });

    pdf.addImage(img, "PNG", margin, 60, pageWidth - margin * 2, 520);
    pdf.save("my-reading-world-poster.pdf");
  };

  const baseButtonStyle = {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "2px dashed #9CC69B",
    fontFamily: "sans-serif",
    cursor: "pointer",
    transition: ".25s ease",
    fontSize: "14px",
  };

  /* -------------------------- RETURN --------------------------- */
  return (
    <div style={{ textAlign: "center" }}>
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          padding: "0 40px",
        }}
      >
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
  
        <div
          style={{
            fontSize: "14px",
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
  
      {/* Book Form */}
      {!formSubmitted && (
        <form style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Book Title"
            value={bookInfo.title}
            onChange={(e) =>
              setBookInfo({ ...bookInfo, title: e.target.value })
            }
            required
          />
  
          <input
            type="text"
            placeholder="Author"
            value={bookInfo.author}
            onChange={(e) =>
              setBookInfo({ ...bookInfo, author: e.target.value })
            }
            required
          />
  
          <input
            type="text"
            placeholder="Your Name"
            value={bookInfo.name}
            onChange={(e) =>
              setBookInfo({ ...bookInfo, name: e.target.value })
            }
            required
          />
  
          <input
            type="date"
            value={bookInfo.date}
            onChange={(e) =>
              setBookInfo({ ...bookInfo, date: e.target.value })
            }
            required
          />
        </form>
      )}
  
      {/* ⭐ EMOJI-STYLE POPUP PICKER */}
      {showStickerPicker && (
        <div
          onClick={() => setShowStickerPicker(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.15)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "14px",
              border: "2px solid #9CC69B",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              width: "420px",
              maxHeight: "60vh",
              overflowY: "scroll",
              animation: "popIn 0.2s ease-out",
            }}
          >
            <h3 style={{ textAlign: "left", fontFamily: "sans-serif" }}>
              Pick a Sticker
            </h3>
  
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, 70px)",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              {STICKER_LIBRARY.map((s) => (
                <div
                  key={s.url}
                  onClick={() => {
                    setSelectedSticker(s.url);
                    setShowStickerPicker(false);
                  }}
                  style={{
                    padding: "6px",
                    cursor: "pointer",
                    borderRadius: "10px",
                    border:
                      selectedSticker === s.url
                        ? "3px solid #9CC69B"
                        : "2px solid transparent",
                  }}
                >
                  <img
                    src={s.url}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
  
      {/* CENTERED CHANGE STICKER + SUBMIT STACK */}
      {!formSubmitted && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            marginBottom: "40px",
            marginTop: "20px",
          }}
        >
          {/* Change Sticker */}
          <button
            type="button"
            onClick={() => setShowStickerPicker(true)}
            style={{
              ...baseButtonStyle,
              background: "#f7fff7",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              padding: "8px 12px",
            }}
          >
            {selectedSticker ? (
              <>
                <img
                  src={selectedSticker}
                  style={{ width: "28px", height: "28px", objectFit: "contain" }}
                />
                Select Sticker
              </>
            ) : (
              "Choose Sticker"
            )}
          </button>
  
          {/* Submit & Earn Sticker */}
          <button
            onClick={handleBookSubmit}
            onMouseEnter={() => setHoverSubmit(true)}
            onMouseLeave={() => setHoverSubmit(false)}
            style={{
              ...baseButtonStyle,
              background: hoverSubmit ? "#e3f8e3" : "#f7fff7",
              padding: "12px 26px",
              fontSize: "12px",
              padding: "8px 12px",
            }}
          >
            Submit & Earn Sticker
          </button>
        </div>
      )}
  
      {/* Export Button */}
      <button
        onClick={handleExportPDF}
        onMouseEnter={() => setHoverExport(true)}
        onMouseLeave={() => setHoverExport(false)}
        style={{
          ...baseButtonStyle,
          marginBottom: "20px",
          marginLeft: "10px",
          display: "block",
          textAlign: "left",
          fontSize: "10px",
          padding: "8px 12px",
          background: hoverExport ? "#d9ffe9" : "#f7fff7",
        }}
      >
        Export Canvas as PDF
      </button>
  
      {/* Canvas */}
      <div
        id="art-canvas"
        style={{
          width: "2000px",
          height: "2000px",
          border: "1px solid #ccc",
          position: "relative",
          overflow: "hidden",
          backgroundImage: 'url("/stickers/background.jpg")',
          backgroundRepeat: "repeat",
          backgroundSize: "20%",
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
