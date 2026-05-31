export default function Logo({ size = 28, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) {
  const color = variant === "light" ? "#1a1a1a" : "#ffffff";
  return (
    <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: size, letterSpacing: '-0.03em', color, lineHeight: 1 }}>
      Origio
    </span>
  );
}