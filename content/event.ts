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
   * Delegates apply through the event's page on the ESN events platform.
   * While this is null the call to action renders as "Applications open
   * soon" instead of a dead link.
   */
  applicationUrl: 'https://events.esn.org/event/seep-çanakkale-2026' as string | null,

  /**
   * When that page accepts applications: Thursday 27 August – Sunday 6
   * September 2026. Verified against a calendar, like the event's own dates.
   * The labels are what the closing scene says out loud — kept here with the
   * dates they render so the two cannot drift apart.
   */
  applicationStartDate: '2026-08-27',
  applicationEndDate: '2026-09-06',
  applicationWindowLabel: '27 August – 6 September 2026',
  applicationCloseLabel: '6 September',
} as const
