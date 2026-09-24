import { defineCollection, z } from 'astro:content';

const briefFields = {
  id: z.string(),
  title: z.string(),
  description: z.string(),
  publishDate: z.string(),
  updatedDate: z.string(),
  tags: z.array(z.string()).default([]),
  sourceLinks: z.array(z.string().url()).default([]),
  summaryType: z.string(),
  draft: z.boolean().default(false),
};

const blog = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('lang', [
    z.object({
      ...briefFields,
      lang: z.literal('en'),
      translationOf: z.null(),
    }),
    z.object({
      ...briefFields,
      lang: z.literal('hi'),
      translationOf: z.string().min(1),
    }),
  ]),
});

export const collections = { blog };
