import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const now = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/now" }),
  schema: z.object({
    updated: z.coerce.date(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    stack: z.array(z.string()).optional(),
    pillar: z.enum(["Finance leadership", "Cross-functional translation", "AI-native finance ops"]).optional(),
    status: z.enum(["Shipped", "In progress", "Coming soon"]),
    link: z.string().url().optional(),
    embed: z.string().optional(),
    repo: z.string().url().optional(),
    order: z.number(),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    kind: z.enum(["published", "recommended"]),
    title: z.string(),
    published: z.coerce.date(),
    description: z.string(),
    link: z.string().url().optional(),
    author: z.string().optional(),
    source: z.string().optional(),
  }),
});

export const collections = { now, projects, writing };
