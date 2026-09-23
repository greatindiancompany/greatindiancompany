/**
 * Astro 4 reads src/content/config.ts. This file re-exports that schema so a
 * second, looser collection cannot be introduced beside it.
 */
export { collections } from './content/config';
