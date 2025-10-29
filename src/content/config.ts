import { defineCollection, z } from 'astro:content';

const bibleCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    genre: z.string(),
    group: z.string(),
  }),
});

export const collections = {
  bible: bibleCollection,
};
