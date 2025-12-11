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
   

      {/* Shared World Canvas (keeps the leafy header from Canvas) */}
      <Canvas worldId={1} />
    </div>
  );
}
