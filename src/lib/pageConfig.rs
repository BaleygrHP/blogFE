// lib/pageConfig.ts
export const pageConfig: Record<string, {
  type: 'home' | 'category' | 'static';
  title?: string;
  section?: 'EDITORIAL' | 'NOTES' | 'DIARY';
}> = {
  'home': { type: 'home' },
  'category': { type: 'category', section: 'NOTES', title: 'Notes' },
  'abcd': { type: 'static', title: 'ABCD' },
}
