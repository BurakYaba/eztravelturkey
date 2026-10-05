import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { ImageId } from '@/data/images';

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  image: ImageId;
  order: number;
  tours: string[];
  body: string;
  readingMinutes: number;
};

const dir = path.join(process.cwd(), 'content', 'travel-hub');

const toIso = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value));

function read(file: string): Article {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const { data, content } = matter(raw);
  const words = content.trim().split(/\s+/).length;
  return {
    slug: file.replace(/\.md$/, ''),
    title: String(data.title),
    description: String(data.description),
    category: String(data.category),
    date: toIso(data.date),
    image: data.image as ImageId,
    order: Number(data.order ?? 99),
    tours: (data.tours as string[] | undefined) ?? [],
    body: content,
    readingMinutes: Math.max(2, Math.round(words / 200)),
  };
}

export function getArticles(): Article[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map(read)
    .sort((a, b) => a.order - b.order);
}

export const getArticle = (slug: string) => getArticles().find((a) => a.slug === slug);

export const articleCategories = () => Array.from(new Set(getArticles().map((a) => a.category)));
