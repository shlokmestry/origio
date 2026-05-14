"use client";

interface SearchIllustrationProps {
  isTyping?: boolean;
  isVisible?: boolean;
}

export default function SearchIllustration({
  isTyping = false,
  isVisible = true,
}: SearchIllustrationProps) {
  return (
    <div
      style={{
        width: 320,
        height: 320,

        opacity: isVisible ? 1 : 0,

        transform: isTyping
          ? "rotate(-10deg) translateY(-4px)"
          : "rotate(-10deg) translateY(0px)",

        transition:
          "transform 0.25s ease, opacity 0.25s ease",

        pointerEvents: "none",
        userSelect: "none",

        position: "relative",

        filter:
          "drop-shadow(0 14px 40px rgba(255,255,255,0.12))",
      }}
    >
      {/* Soft glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,

          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 72%)",

          filter: "blur(24px)",
          transform: "scale(0.9)",

          zIndex: 0,
        }}
      />

      {/* Illustration */}
      <img
        src="/illustration.png"
        alt="Search illustration"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",

          userSelect: "none",
          pointerEvents: "none",

          position: "relative",
          zIndex: 1,

          animation: isTyping
            ? "searchFloat 2.4s ease-in-out infinite"
            : "none",

          mixBlendMode: "screen",
        }}
      />

      <style>{`
        @keyframes searchFloat {
          0% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-6px);
          }

          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}