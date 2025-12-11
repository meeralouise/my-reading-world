import { useState, useEffect } from "react";
import Sticker from "./sticker";
import { STICKER_LIBRARY } from "../lib/stickerLibrary.js";
import localFont from "next/font/local";

const organical = localFont({
  src: "../fonts/organical-personal-use.ttf",
});

export default function Canvas({
  worldId = 1,
  canEdit = true,
  showHeader = true, // optional prop
  topBanner = null,
}) {
  const [hoverSubmit, setHoverSubmit] = useState(false);
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

  // Form completion checker
  const formCompleted =
    bookInfo.title && bookInfo.author && bookInfo.name && bookInfo.date;

  useEffect(() => setIsClient(true), []);

  // Reset form when world changes
  useEffect(() => {
    setFormSubmitted(false);
    setBookInfo({
      title: "",
      author: "",
      name: "",
      date: "",
    });
  }, [worldId]);

  useEffect(() => {
    if (!isClient) return;

    const fetchStickers = async () => {
      try {
        const res = await fetch(`/api/stickers?world_id=${worldId}`);
        const data = await res.json();
        if (Array.isArray(data)) setStickers(data);
      } catch (err) {
        console.error("Failed to fetch stickers:", err);
      }
    };

    fetchStickers();
  }, [isClient, worldId]);

  if (!isClient) return null;

  /* ---------------------- Dragging + Saving ----------------------- */

  const handleDragEnd = async (id, x, y) => {
    if (!canEdit) return; // view-only: no drag

    setStickers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, x_position: x, y_position: y } : s
      )
    );

    try {
      await fetch(`/api/stickers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x_position: x, y_position: y }),
      });
    } catch (err) {
      console.error("Failed to save drag:", err);
    }
  };

  const handleScaleChange = async (id, scale) => {
    if (!canEdit) return; // view-only: no scale

    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, scale } : s))
    );

    try {
      await fetch(`/api/stickers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scale }),
      });
    } catch (err) {
      console.error("Failed to save scale:", err);
    }
  };

  /* ---------------------- Submitting a Book ----------------------- */

  const handleBookSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) {
      alert("This world is read-only until the access code is entered.");
      return;
    }

    if (!formCompleted) {
      alert("Please complete the entire form before submitting.");
      return;
    }

    if (!selectedSticker) {
      alert("Please choose a sticker before submitting.");
      return;
    }

    const newSticker = {
      world_id: worldId,
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

      const saved = await res.json();
      setStickers((prev) => [...prev, saved]);
      setFormSubmitted(true);
    } catch (err) {
      console.error("Failed to save sticker:", err);
    }
  };

  /* ---------------------- Export PDF ----------------------- */

const handleExportPDF = async (size = "tabloid") => {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const element = document.getElementById("art-canvas");
  if (!element) return;

  const bgColor = window.getComputedStyle(element).backgroundColor;

  const canvas = await html2canvas(element, {
    scale: 4,
    backgroundColor: bgColor,
  });

  const img = canvas.toDataURL("image/png");

  let format, filename;

  if (size === "letter") {
    // 11 x 8.5 in (landscape) in points
    format = [792, 612];
    filename = "my-reading-world-letter.pdf";
  } else {
    // 17 x 11 in (landscape) in points
    format = [1224, 792];
    filename = "my-reading-world-tabloid.pdf";
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Optional footer text
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Our Reading World!", 40, pageHeight - 30);

  // ----- SCALE IMAGE TO MAX WIDTH, KEEP RATIO -----
  const origWidth = canvas.width;
  const origHeight = canvas.height;

  // Use full page width for the canvas image
  let displayWidth = pageWidth;
  let displayHeight = (origHeight / origWidth) * displayWidth;

  // Safety: if somehow taller than the page, fall back to height-based scaling
  if (displayHeight > pageHeight) {
    displayHeight = pageHeight;
    displayWidth = (origWidth / origHeight) * displayHeight;
  }

  // Small top margin, no huge gap
  const topMargin = 20; // ~0.28"
  const x = (pageWidth - displayWidth) / 2; // usually 0 when full width
  const y = topMargin;

  // Draw image (no border box so it can sit right near the top)
  pdf.addImage(img, "PNG", x, y, displayWidth, displayHeight);

  pdf.save(filename);
};


  /* ---------------------- Base Button Style ------------------------ */

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
    <div style={{ textAlign: "center",
    
 }}>
      {/* optional banner from the page (for non-shared worlds) */}
      {topBanner}

      {/* Compact Header + Form + Buttons */}
      <div
        style={{
          margin: "0 auto 20px",
          maxWidth: "980px",
          padding: "12px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "18px",
          borderRadius: "18px",
          background: "#f7fdf7",
          border: "1px dashed #9CC69B",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        {/* Left side: Title + Instructions */}
        {showHeader && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "flex-start",
              flexShrink: 0,
            }}
          >
            <h1
              className={organical.className}
              style={{
                display: "inline-block",
                padding: "10px 30px",
                fontSize: "44px",
                letterSpacing:"1px",
                borderRadius: "999px",
                border: "3px dashed #D7648C",
                backgroundImage: "url('/stickers/background2.jpg')",
                color: "#421C0B",
                WebkitTextStroke: ".4px white",
                whiteSpace: "nowrap",
              }}
            >
              Our Reading World!
            </h1>

            <div
              style={{
                fontSize: "12px",
                maxWidth: "230px",
                lineHeight: "1.4",
                textAlign: "left",
                padding: "0.75rem",
                borderRadius: "12px",
                background: "#f9f9f9",
                border: "1px dashed #ddd",
                boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                fontFamily: "sans-serif",
              }}
            >
              <strong>How it works:</strong>
              <br />
              Log a book → choose a sticker → place it anywhere!
            </div>
          </div>
        )}

        {/* Right side: form + buttons */}
        <div
          style={{
            flex: 1,
            minWidth: "260px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "stretch",
          }}
        >
          {/* Book Form (only if canEdit) */}
          {canEdit && !formSubmitted && (
            <form style={{ margin: 0 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "6px",
                }}
              >
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
              </div>
            </form>
          )}

          {/* Sticker Picker Button + Submit */}
          {canEdit && !formSubmitted && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "6px",
              }}
            >
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
                      style={{ width: "28px", height: "28px" }}
                    />
                    Select Sticker
                  </>
                ) : (
                  "Choose Sticker"
                )}
              </button>

              <button
                onClick={handleBookSubmit}
                onMouseEnter={() => setHoverSubmit(true)}
                onMouseLeave={() => setHoverSubmit(false)}
                style={{
                  ...baseButtonStyle,
                  background: hoverSubmit ? "#e3f8e3" : "#f7fff7",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
              >
                Submit & Earn Sticker
              </button>
            </div>
          )}

          {/* Export Buttons */}
          <div
            style={{
              marginTop: "6px",
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              justifyContent: "flex-end",
            }}
          >
            <button
              style={{
                ...baseButtonStyle,
                background: "#f7fdf7",
                fontSize: "10px",
                padding: "6px 10px",
              }}
              onClick={() => handleExportPDF("letter")}
            >
              Export Letter
            </button>

            <button
              style={{
                ...baseButtonStyle,
                background: "#f7fdf7",
                fontSize: "10px",
                padding: "6px 10px",
              }}
              onClick={() => handleExportPDF("tabloid")}
            >
              Export Tabloid
            </button>
          </div>
             {/* Tiny navigation row with Explore Worlds */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <a
          href="/worlds"
          style={{
            padding: "8px 16px",
            border: "2px dashed #9CC69B",
            borderRadius: "12px",
            background: "#f7fff7",
            textDecoration: "none",
            color: "#333",
            fontSize: "14px",
          }}
        >
          Explore Worlds
        </a>
      </div>
        </div>
      </div>

      {/* Sticker Picker Modal (edit-only) */}
      {canEdit && showStickerPicker && (
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
              background: "#2e4e1d",
              padding: "20px",
              borderRadius: "7px",
              border: "2px solid #9CC69B",
              width: "420px",
              maxHeight: "60vh",
              overflowY: "scroll",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontFamily: "sans-serif",
                color: "white",
              }}
            >
              pick a sticker!
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, 60px)",
                gap: "6px",
                marginTop: "12px",
              }}
            >
              {STICKER_LIBRARY.map((s) => {
                const rotation = Math.random() * 24 - 12;

                return (
                  <div
                    key={s.url}
                    onClick={() => {
                      setSelectedSticker(s.url);
                      setShowStickerPicker(false);
                    }}
                    style={{
                      cursor: "pointer",
                      transform: `rotate(${rotation}deg)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "rotate(0deg) scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = `rotate(${rotation}deg)`;
                    }}
                  >
                    <img
                      src={s.url}
                      style={{
                        width: "80px",
                        height: "70px",
                        objectFit: "contain",
                        pointerEvents: "none",
                        display: "block",
                        filter: `
                          drop-shadow(0 0 2px white)
                          drop-shadow(0 0 1px #9CC69B)
                          drop-shadow(0 0 1px white)
                        `,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        id="art-canvas"
        style={{
          width: "4000px",
          height: "2000px",
          border: "1px solid #ccc",
          position: "relative",
          overflowY: "hidden",
          overflowX: "scroll",
          background: "#f7fdf7",
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
