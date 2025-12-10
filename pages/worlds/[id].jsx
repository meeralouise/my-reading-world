import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import Canvas dynamically to avoid hydration mismatch issues
const Canvas = dynamic(() => import("../../components/canvas.jsx"), {
  ssr: false,
});

export default function WorldPage() {
  const router = useRouter();
  const { id } = router.query;

  const [worldName, setWorldName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  // Fetch world info based on ID
  useEffect(() => {
    if (!id) return;

    async function loadWorld() {
      try {
        const res = await fetch(`/api/worlds/${id}`);
        const data = await res.json();

        if (data?.name) setWorldName(data.name);

        const priv = !!data?.is_private;
        setIsPrivate(priv);

        // World 1 is always editable, and any public world is editable
        if (Number(id) === 1 || !priv) {
          setCanEdit(true);
        }
      } catch (err) {
        console.error("Failed to load world:", err);
      }
    }

    loadWorld();
  }, [id]);

  const handleUnlock = async () => {
    const trimmed = codeInput.trim();
    if (!trimmed) {
      alert("Please enter an access code.");
      return;
    }

    try {
      const res = await fetch("/api/worlds/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: trimmed }),
      });

      const data = await res.json();

      if (data?.id === Number(id)) {
        setCanEdit(true);
        alert("Editing unlocked for this world.");
      } else {
        alert("Incorrect access code for this world.");
      }
    } catch (err) {
      console.error("Unlock error:", err);
      alert("Something went wrong while checking the code.");
    }
  };

  if (!id) return <div>Loading world...</div>;

  const numericId = Number(id);
  const isSharedMain = numericId === 1; // shared world (should look like /)

  return (
    <div
      style={{
        paddingTop: "24px",
        paddingBottom: "40px",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      {/* ---------- PRIVATE/PUBLIC WORLD HEADER (CENTERED) ---------- */}
      {!isSharedMain && (
        <div
          style={{
            margin: "0 auto 20px",
            maxWidth: "980px", // match homepage header width
            padding: "10px 14px",
            borderRadius: "18px",
            border: "2px dashed #9CC69B",
            background: "#f7fff7",
            textAlign: "left", // so text inside isn’t centered
          }}
        >
          {/* top row: back button + title/meta */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              rowGap: "8px",
              columnGap: "12px",
            }}
          >
            {/* Back Home Button */}
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "6px 12px",
                border: "2px dashed #9CC69B",
                borderRadius: "12px",
                background: "#ffffff",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              ← Back to Shared World
            </button>

            {/* Title + meta */}
            <div style={{ textAlign: "right" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "22px",
                  padding: "4px 16px",
                  borderRadius: "999px",
                  border: "2px dashed #9CC69B",
                  background: "#ffffff",
                  display: "inline-block",
                }}
              >
                {worldName || "Loading..."}
              </h1>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "#555",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    border: "1px dashed #9CC69B",
                    background: isPrivate ? "#ffeef2" : "#eefdf2",
                    marginRight: "6px",
                  }}
                >
                  {isPrivate ? "🔒 Private world" : "🌱 Public world"}
                </span>
                {canEdit
                  ? "You can edit this world."
                  : "You’re currently viewing only."}
              </div>
            </div>
          </div>

          {/* Private world unlock controls */}
          {isPrivate && !canEdit && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
              }}
            >
              <span style={{ minWidth: "160px" }}>
                Enter the access code to edit:
              </span>
              <input
                type="text"
                placeholder="Access Code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                style={{
                  flex: "1 1 160px",
                  padding: "6px 8px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "13px",
                  minWidth: "0",
                }}
              />
              <button
                onClick={handleUnlock}
                style={{
                  padding: "6px 12px",
                  borderRadius: "10px",
                  border: "2px dashed #9CC69B",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                }}
              >
                Unlock Editing
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------- CANVAS (SAME BEHAVIOR AS HOMEPAGE) ---------- */}
      <Canvas
        worldId={numericId}
        canEdit={canEdit}
        showHeader={true} // compact header + banner inside, like homepage
      />
    </div>
  );
}
