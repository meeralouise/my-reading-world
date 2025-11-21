import { useState, useEffect } from "react";
import Sticker from "./sticker";
import { STICKER_LIBRARY } from "../lib/stickerLibrary.js";
import localFont from "next/font/local";

const organical = localFont({
  src: "../fonts/organical-personal-use.ttf",
});

export default function Canvas() {
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

 
  useEffect(() => setIsClient(true), []);

 
  useEffect(() => {
    if (!isClient) return;

    const fetchStickers = async () => {
      try {
        const res = await fetch("/api/stickers");
        const data = await res.json();
        if (Array.isArray(data)) setStickers(data);
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
      format = [792, 612];
      filename = "my-reading-world-letter.pdf";
    } else {
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
  
   
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(14);
  
    pdf.text("Our Reading World!", 40, pageHeight - 30);
  
  
    const margin = 20; 
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - 60;
  
    const origWidth = canvas.width;
    const origHeight = canvas.height;
  

    let displayWidth = (origWidth * maxHeight) / origHeight;
    let displayHeight = maxHeight;
  
    if (displayWidth > maxWidth) {
      displayWidth = maxWidth;
      displayHeight = (origHeight * maxWidth) / origWidth;
    }
  

    const x = (pageWidth - displayWidth) / 2;
    const y = (pageHeight - displayHeight) / 2 - 10;
  
 
    pdf.setDrawColor(200);
    pdf.setLineWidth(1);
    pdf.rect(x - 5, y - 5, displayWidth + 10, displayHeight + 10);
  
    pdf.addImage(img, "PNG", x, y, displayWidth, displayHeight);
  
    pdf.save(filename);
  };
  

  /* ---------------------- Base Button Style ----------------------- */
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
          className={organical.className}
          style={{
            display: "inline-block",
            padding: "12px 40px",
            fontSize: "50px",
            borderRadius: "999px",
            border: "3px dashed #f7fff7",
            backgroundImage: 'url("/stickers/background2.jpg")',
            color: "#421C0B",
            WebkitTextStroke: ".25px white",
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
          Log a book → earn a sticker → place it anywhere in our town!
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

      {/* Sticker Picker */}
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
              background: "#2e4e1d",
              padding: "20px",
              borderRadius: "7px",
              border: "2px solid #9CC69B",
              width: "420px",
              maxHeight: "60vh",
              overflowY: "scroll",
            }}
          >
            <h3 style={{ textAlign: "center", fontFamily: "sans-serif", color: "white", }}>
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
              {STICKER_LIBRARY.map((s, i) => {
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
        e.currentTarget.style.transform = "rotate(0deg) scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rotation}deg)`;
      }}
    >
      <img
        src={s.url}
        style={{
          width: "70px",
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

      {/* Sticker + Submit */}
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
    marginBottom: "20px",
    display: "flex",
    gap: "5px",
    justifyContent: "left",
    padding: "0px 10px",
  }}
>
  <button
    style={{
      ...baseButtonStyle,       // ← keep this
      background: "#f7fdf7",    // ← override background
      fontSize: "10px",         // ← override font size
      padding: "6px 10px",      // ← optional smaller padding
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

      {/* Canvas */}
      <div
        id="art-canvas"
        style={{
          width: "4000px",
          height: "2000px",
          border: "1px solid #ccc",
          position: "relative",
          overflow: "hidden",
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
