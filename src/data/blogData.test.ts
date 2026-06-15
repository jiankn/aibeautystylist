import { describe, expect, it } from "vitest";

import { blogSlugs, getBlogPosts } from "./blogData";

const posts = getBlogPosts("zh-CN");
const slugSet = new Set(blogSlugs);
const localizedPostSets = [
  { label: "Chinese", posts: getBlogPosts("zh-CN"), similarityLimit: 0.14 },
  { label: "English", posts: getBlogPosts("en"), similarityLimit: 0.22 },
  { label: "German", posts: getBlogPosts("de-DE"), similarityLimit: null },
  { label: "French", posts: getBlogPosts("fr-FR"), similarityLimit: null },
  { label: "Japanese", posts: getBlogPosts("ja-JP"), similarityLimit: null },
  { label: "Korean", posts: getBlogPosts("ko-KR"), similarityLimit: null },
  {
    label: "Traditional Chinese",
    posts: getBlogPosts("zh-TW"),
    similarityLimit: null,
  },
  { label: "Spanish", posts: getBlogPosts("es-ES"), similarityLimit: null },
  { label: "Portuguese", posts: getBlogPosts("pt-BR"), similarityLimit: null },
] as const;
const characterSimilarityLabels = new Set([
  "Chinese",
  "Japanese",
  "Korean",
  "Traditional Chinese",
]);

function visibleText(content: string) {
  return content
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function readableText(content: string) {
  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function matches(content: string, pattern: RegExp) {
  return [...content.matchAll(pattern)].map((match) => match[1].trim());
}

function count(content: string, pattern: RegExp) {
  return [...content.matchAll(pattern)].length;
}

function trigrams(text: string) {
  return new Set(
    Array.from({ length: Math.max(0, text.length - 2) }, (_, index) =>
      text.slice(index, index + 3),
    ),
  );
}

function wordShingles(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  return new Set(
    Array.from({ length: Math.max(0, words.length - 3) }, (_, index) =>
      words.slice(index, index + 4).join(" "),
    ),
  );
}

function jaccard(left: Set<string>, right: Set<string>) {
  const intersection = [...left].filter((item) => right.has(item)).length;
  return intersection / (left.size + right.size - intersection);
}

describe("Chinese beauty notes editorial quality gate", () => {
  it("publishes exactly ten intentional articles", () => {
    expect(posts).toHaveLength(10);
    expect(blogSlugs).toEqual(posts.map((post) => post.slug));
  });

  it("keeps the same article inventory for every supported blog locale", () => {
    localizedPostSets.forEach(({ posts }) => {
      expect(posts).toHaveLength(10);
      expect(posts.map((post) => post.slug)).toEqual(blogSlugs);
    });
  });

  it("provides localized blog keywords instead of English fallback content", () => {
    const englishTitles = new Set(getBlogPosts("en").map((post) => post.title));
    localizedPostSets
      .filter(({ label }) => !["Chinese", "English"].includes(label))
      .forEach(({ posts }) => {
        posts.forEach((post) => {
          expect(englishTitles.has(post.title)).toBe(false);
          expect(post.seoKeywords?.length).toBeGreaterThanOrEqual(3);
          expect(post.content).not.toContain(
            "Makeup decisions, explained without the hype",
          );
        });
      });
  });

  it("keeps identifiers, titles, summaries, and headings unique", () => {
    localizedPostSets.forEach(({ posts }) => {
      expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
      expect(new Set(posts.map((post) => post.title)).size).toBe(posts.length);
      expect(new Set(posts.map((post) => post.summary)).size).toBe(
        posts.length,
      );

      const headings = posts.flatMap((post) =>
        matches(post.content, /<h2>(.*?)<\/h2>/g),
      );
      expect(new Set(headings).size).toBe(headings.length);
    });
  });

  it("requires a direct lead, substantial body, and multiple decision sections", () => {
    localizedPostSets.forEach(({ posts }) => {
      posts.forEach((post) => {
        expect(post.content).toContain('class="article-lead"');
        expect(visibleText(post.content).length).toBeGreaterThan(1500);
        expect(
          matches(post.content, /<h2>(.*?)<\/h2>/g).length,
        ).toBeGreaterThanOrEqual(6);
        expect(
          count(post.content, /<p(?:\s[^>]*)?>.*?<\/p>/gs),
        ).toBeGreaterThanOrEqual(8);
        expect(
          count(post.content, /<(?:ul|ol|div class="article-matrix")/g),
        ).toBeGreaterThanOrEqual(2);
        expect(count(post.content, /href="\/[^"]+"/g)).toBeGreaterThanOrEqual(
          2,
        );
      });
    });
  });

  it("uses curated related links that resolve to real, different articles", () => {
    localizedPostSets.forEach(({ posts }) => {
      posts.forEach((post) => {
        expect(post.relatedSlugs?.length).toBeGreaterThanOrEqual(2);
        post.relatedSlugs?.forEach((slug) => {
          expect(slug).not.toBe(post.slug);
          expect(slugSet.has(slug)).toBe(true);
        });
      });
    });
  });

  it("keeps article-body blog links and external sources valid", () => {
    localizedPostSets.forEach(({ posts }) => {
      posts.forEach((post) => {
        const linkedSlugs = matches(post.content, /href="\/blog\/([^"]+)"/g);
        linkedSlugs.forEach((slug) => expect(slugSet.has(slug)).toBe(true));

        post.sources?.forEach((source) => {
          expect(source.url.startsWith("https://")).toBe(true);
          expect(source.label.length).toBeGreaterThan(10);
          expect(source.note.length).toBeGreaterThan(10);
        });
      });
    });
  });

  it("provides a bounded image focal point for every article", () => {
    localizedPostSets.forEach(({ posts }) => {
      posts.forEach((post) => {
        const match = post.focalPosition.match(/^(\d{1,3})% (\d{1,3})%$/);
        expect(match).not.toBeNull();

        const horizontalPosition = Number(match?.[1]);
        const verticalPosition = Number(match?.[2]);
        expect(horizontalPosition).toBeGreaterThanOrEqual(0);
        expect(horizontalPosition).toBeLessThanOrEqual(100);
        expect(verticalPosition).toBeGreaterThanOrEqual(15);
        expect(verticalPosition).toBeLessThanOrEqual(45);
      });
    });
  });

  it("uses distinct, descriptive WebP covers", () => {
    localizedPostSets.forEach(({ posts }) => {
      expect(new Set(posts.map((post) => post.coverImage)).size).toBe(
        posts.length,
      );

      posts.forEach((post) => {
        expect(post.coverImage).toMatch(/^\/images\/[a-z0-9-]+\.webp$/);
        expect(post.coverAlt.length).toBeGreaterThan(12);
      });
    });
  });

  it("does not reuse long paragraphs or converge on one article template", () => {
    localizedPostSets.forEach(({ label, posts, similarityLimit }) => {
      const paragraphs = posts
        .flatMap((post) => matches(post.content, /<p(?:\s[^>]*)?>(.*?)<\/p>/gs))
        .map((paragraph) => visibleText(paragraph))
        .filter((paragraph) => paragraph.length > 30);

      expect(new Set(paragraphs).size).toBe(paragraphs.length);

      if (similarityLimit !== null) {
        posts.forEach((post, index) => {
          posts.slice(index + 1).forEach((other) => {
            const left = characterSimilarityLabels.has(label)
              ? trigrams(visibleText(post.content))
              : wordShingles(readableText(post.content));
            const right = characterSimilarityLabels.has(label)
              ? trigrams(visibleText(other.content))
              : wordShingles(readableText(other.content));
            const similarity = jaccard(left, right);
            expect(similarity).toBeLessThan(similarityLimit);
          });
        });
      }
    });
  });
});
