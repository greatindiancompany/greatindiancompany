import { defineCollection, z } from 'astro:content';
import languageEntries from '../../content-automation/config/languages.json';
import { annotateLanguages } from '../lib/i18n-languages.mjs';

const scheduledLanguageCodes = annotateLanguages(languageEntries).map((language) => language.code) as [
  string,
  ...string[],
];

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
      lang: z.enum(scheduledLanguageCodes),
      translationOf: z.string().min(1),
    }),
  ]),
});

export const collections = { blog };
