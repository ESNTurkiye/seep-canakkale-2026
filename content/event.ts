export const event = {
  name: 'SEEP Çanakkale 2026',
  platform: 'South-Eastern European Platform',
  hostSection: 'ESN Çanakkale',
  memberCountries: 15,

  /** Thursday 15 – Sunday 18 October 2026. Verified: 15 Oct 2026 is a Thursday. */
  startDate: '2026-10-15',
  endDate: '2026-10-18',
  dateLabel: '15–18 October 2026',

  city: 'Çanakkale',
  country: 'Türkiye',
  domain: 'seep.esnturkey.org',

  /**
   * No application route exists yet. While this is null the call to action
   * renders as "Applications open soon" instead of a dead link.
   */
  applicationUrl: null as string | null,
} as const
