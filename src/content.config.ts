import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: "**/index.mdx",
    base: "./src/content/blog",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      lang: z.enum(["es-MX", "en-US"]),
    }),
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/index.mdx",
    base: "./src/content/projects",
  }),
  schema: z.object({
    title: z.string(),
    brief_description: z.string(),
    category: z.string(),
    "category-link": z.string().optional(),
    year: z.string(),
    project_id: z.number(),
    lang: z.enum(["es-MX", "en-US"]),
    href: z.string().optional(),
    cta: z.string().optional(),
    "screenshots-prefix": z.string().optional(),
    "screenshot-alts": z.array(z.string()).optional(),
  }),
});

export const collections = { blog, projects };

export function postSlug(id: string): string {
  return id.split("/").slice(1).join("/");
}
