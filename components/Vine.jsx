export default function Vine({ style }) {
    return (
      <svg
        width="300"
        height="200"
        viewBox="0 0 300 200"
        fill="none"
        style={{
          position: "absolute",
          pointerEvents: "none",
          zIndex: -1,
          ...style,
        }}
      >
        <path
          d="M10 10 C 120 80, 180 20, 290 150"
          stroke="#4C7A34"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
  
        {/* little tendrils */}
        <path
          d="M150 60 C 160 70, 170 90, 180 100"
          stroke="#4C7A34"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M80 40 C 90 60, 100 80, 110 85"
          stroke="#4C7A34"
          strokeWidth="3"
          fill="none"
        />
      </svg>
    );
  }
  