import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import localFont from "next/font/local";

const organical = localFont({
  src: "../../fonts/organical-personal-use.ttf",
});

export default function WorldsHome() {
  const router = useRouter();

  const [worlds, setWorlds] = useState([]);

  // Create world inputs
  const [worldName, setWorldName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // Join world input
  const [accessCode, setAccessCode] = useState("");

  const [creating, setCreating] = useState(false);

  // Fetch all worlds on load
  useEffect(() => {
    const fetchWorlds = async () => {
      try {
        const res = await fetch("/api/worlds");
        const data = await res.json();
        if (Array.isArray(data)) setWorlds(data);
      } catch (err) {
        console.error("Failed to load worlds:", err);
      }
    };

    fetchWorlds();
  }, []);

  // ---------------------------
  // CREATE WORLD
  // ---------------------------
  const handleCreateWorld = async () => {
    if (!worldName) {
      alert("Please enter a world name.");
      return;
    }

    try {
      setCreating(true);

      const res = await fetch("/api/worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: worldName,
          is_private: isPrivate,
        }),
      });

      const data = await res.json();

      if (!data || !data.id) {
        alert("Failed to create world.");
        setCreating(false);
        return;
      }

      // If private, show access code once
      if (data.is_private && data.access_code) {
        alert(
          `Your private world is created!\n\n` +
            `🌱 World Name: ${data.name}\n\n` +
            `🔑 Access Code: ${data.access_code}\n\n` +
            `Share this code with anyone who should be able to contribute.`
        );
      }

      // Add to local list so it appears in gallery
      setWorlds((prev) => [data, ...prev]);

      // Clear form
      setWorldName("");
      setIsPrivate(false);

      // Jump into the new world
      router.push(`/worlds/${data.id}`);
    } catch (err) {
      console.error("Create world error:", err);
      alert("Something went wrong while creating the world.");
    } finally {
      setCreating(false);
    }
  };

  // ---------------------------
  // JOIN WORLD BY ACCESS CODE
  // ---------------------------
  const handleJoinWorld = async () => {
    if (!accessCode) {
      alert("Please enter an access code.");
      return;
    }

    try {
      const res = await fetch("/api/worlds/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: accessCode }),
      });

      const data = await res.json();

      if (data.id) {
        router.push(`/worlds/${data.id}`);
      } else {
        alert("World not found. Check the access code.");
      }
    } catch (err) {
      console.error("Join world error:", err);
      alert("Something went wrong while joining the world.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif",
    border: "20px dashed #F0D667",
      margin: "10px",
      borderRadius: "5px",
      padding: "10px",
      minHeight: "calc(100vh - 40px)", 
      boxSizing: "border-box",
      backgroundImage: "url('/stickers/background2.jpg')",
      }}>

      <h1 
      className={organical.className}
      style={{ textAlign: "center", marginBottom: "10px", 
      fontSize: "44px",
      WebkitTextStroke: ".25px white",
      color: "white", }}>
        Explore Book Worlds
      </h1>
      <p
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "14px",
          color: "white",
          fontFamily: "monospace",
          background:"#D7648C",
        }}
      >
        Click a world to visit it. Private worlds are view-only unless you have
        the access code to edit. 
      </p>

      <p
       style={{
        textAlign: "center",
        margin: "10px",
        fontSize: "15px",
        background:"#D7648C",
        fontWeight: "bold",
        color: "white",
        fontFamily: "monospace",
      }}
    >
      Be sure to screenshot your code so you don't forget it!
      </p>


      {/* Top controls: create + join */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        {/* Create World */}
        <div
          style={{
            minWidth: "260px",
            padding: "16px 20px",
            border: "2px dashed #9CC69B",
            borderRadius: "16px",
            background: "#f7fff7",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "8px" }}>Create a World</h3>
          <input
            type="text"
            placeholder="World Name"
            value={worldName}
            onChange={(e) => setWorldName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "6px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            Private (code required to edit)
          </label>
          <button
            onClick={handleCreateWorld}
            disabled={creating}
            style={{
              marginTop: "14px",
              padding: "8px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              border: "2px dashed #9CC69B",
              background: "#f7fff7",
              fontSize: "14px",
            }}
          >
            {creating ? "Creating..." : "Create World"}
          </button>
        </div>

        {/* Join World by access code */}
        <div
          style={{
            minWidth: "260px",
            padding: "16px 20px",
            border: "2px dashed #9CC69B",
            borderRadius: "16px",
            background: "#f7fff7",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "8px" }}>Join by Code</h3>
          <input
            type="text"
            placeholder="Access Code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "6px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleJoinWorld}
            style={{
              marginTop: "4px",
              padding: "8px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              border: "2px dashed #9CC69B",
              background: "#f7fff7",
              fontSize: "14px",
            }}
          >
            Go to World
          </button>
        </div>
      </div>

      {/* Worlds gallery */}
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            marginBottom: "12px",
            textAlign: "left",
          }}
        >
          All Worlds
        </h2>

        {worlds.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#666" }}>
            No worlds yet. Create one to get started!
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {worlds.map((w) => (
              <div
                key={w.id}
                onClick={() => w.id === 1 ? router.push("/") : router.push(`/worlds/${w.id}`)}
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "2px dashed #9CC69B",
                  background: "#f7fff7",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0,0,0,0.05)";
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "4px",
                    fontSize: "15px",
                  }}
                >
                  {w.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    marginBottom: "6px",
                    color: "#555",
                  }}
                >
                  World #{w.id}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    border: "1px dashed #9CC69B",
                    background: w.is_private ? "#ffeef2" : "#eefdf2",
                    color: "#444",
                  }}
                >
                  {w.is_private ? "🔒 Private (view-only until code)" : "🌱 Public"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
