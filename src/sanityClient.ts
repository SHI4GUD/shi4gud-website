import {createClient} from '@sanity/client'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  useCdn: true, // Enable CDN for better performance
  apiVersion: '2025-06-07',
  perspective: 'published',
}) 