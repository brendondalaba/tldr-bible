import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const bible = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/bible" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    verse: z.string(),
    genre: z.string(),
    group: z.string(),
  }),
});

export const collections = { bible };
