export default function Logo({ size = 14 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: size,
        height: size,
        background: "#00ffd5",
        border: "2px solid #f0f0e8",
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "Cabinet Grotesk, sans-serif",
        fontWeight: 800,
        fontSize: size * 1.3,
        letterSpacing: "-0.02em",
        textTransform: "uppercase" as const,
        color: "#f0f0e8",
        lineHeight: 1,
      }}>
        ORIGIO
      </span>
    </div>
  );
}