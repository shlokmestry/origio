export default function Logo({ size = 28, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) {
  const src = variant === "light" ? "/origiologo2.png" : "/origiologo1.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Origio" style={{ height: size, width: "auto", display: "block" }} />
  );
}