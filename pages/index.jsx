import Canvas from "../components/canvas";

export default function Home() {
  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: "20px",
        fontFamily: "sans-serif",
      }}
    >
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

      {/* Shared World Canvas (keeps the leafy header from Canvas) */}
      <Canvas worldId={1} />
    </div>
  );
}
