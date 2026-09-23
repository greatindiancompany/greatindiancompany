import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    lang: z.literal('en'),
    translationOf: z.null(),
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    updatedDate: z.string(),
    tags: z.array(z.string()).default([]),
    sourceLinks: z.array(z.string().url()).default([]),
    summaryType: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
