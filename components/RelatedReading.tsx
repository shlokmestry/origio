import Link from "next/link";
import type { RelatedPost } from "@/lib/relatedPosts";

const CATEGORY_COLORS: Record<string, string> = {
  "Insights": "#a78bfa",
  "Salary Guides": "#4ade80",
  "Visa Guides": "#60a5fa",
  "City Comparisons": "#f472b6",
  "Tax & Finance": "#fbbf24",
  "Rankings": "#00ffd5",
};

export default function RelatedReading({ posts }: { posts: RelatedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
      <p style={{
        fontFamily: "'Satoshi', sans-serif",
        fontSize: 9, fontWeight: 800, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(240,240,232,0.35)",
        marginBottom: 16,
      }}>
        Related Reading
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, textDecoration: "none",
              border: "1px solid #1f1f1f", background: "#0f0f0f",
              padding: "14px 18px", transition: "border-color 0.15s",
            }}
            className="related-reading-item"
          >
            <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={{
                flexShrink: 0,
                fontFamily: "'Satoshi', sans-serif",
                fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: CATEGORY_COLORS[p.category] ?? "#00ffd5",
                border: `1px solid ${(CATEGORY_COLORS[p.category] ?? "#00ffd5")}55`,
                padding: "3px 8px",
              }}>
                {p.category}
              </span>
              <span style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: 14, color: "#f0f0e8",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {p.title}
              </span>
            </span>
            <span style={{ flexShrink: 0, color: "#00ffd5", fontSize: 13 }}>→</span>
          </Link>
        ))}
      </div>
      <style>{`.related-reading-item:hover { border-color: #00ffd5 !important; }`}</style>
    </section>
  );
}
