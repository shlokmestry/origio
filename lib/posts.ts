import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/posts");

export function getAllPosts() {
  // Return empty array if folder doesn't exist yet
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

  return files.map((filename) => {
    const slug = filename.replace(".mdx", "");
    const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title as string,
      description: data.description as string,
      date: data.date as string,
    };
  });
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(postsDir, `${slug}.mdx`);

  // Return null if file doesn't exist
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { data, content };
}