import Image from "next/image";

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/origio_logo_dark_final.png"
      alt="Origio"
      width={size * 4}
      height={size}
      style={{ height: size, width: "auto", display: "block" }}
      priority
    />
  );
}