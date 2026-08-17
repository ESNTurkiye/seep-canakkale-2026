/**
 * The sixteen Organising Committee members, in the order they hang on the wall.
 *
 * `antiqueTitle` is the museum-label conceit: an antique title above the real
 * role, the way a gallery labels a portrait. These are PROPOSALS and need each
 * person's approval before going live, same as their portrait.
 *
 * `portrait` points at public/portraits/<slug>.png. A missing file is expected
 * and handled — the frame renders empty with the label intact, so portraits can
 * arrive one at a time. See docs/art-direction.md.
 */

export type OcMember = {
  slug: string
  name: string
  role: string
  antiqueTitle: string
}

export const oc: OcMember[] = [
  {
    slug: 'burcu-ozdemir',
    name: 'Burcu Özdemir',
    role: 'Head of the OC',
    antiqueTitle: 'Keeper of the Gates',
  },
  {
    slug: 'berkay-kiran',
    name: 'Berkay Kıran',
    role: 'Vice Head of the OC · Internal Relations',
    antiqueTitle: 'Voice of the Inner Court',
  },
  {
    slug: 'furkan-ucar',
    name: 'Furkan Uçar',
    role: 'Vice Head of the OC · External Relations',
    antiqueTitle: 'Voice Beyond the Walls',
  },
  {
    slug: 'cagatay-cavus',
    name: 'Çağatay Çavuş',
    role: 'Financial Responsible',
    antiqueTitle: 'Keeper of the Treasury',
  },
  {
    slug: 'ece-dikbiyik',
    name: 'Ece Dikbıyık',
    role: 'Communication Responsible',
    antiqueTitle: 'Herald',
  },
  {
    slug: 'furkan-akcay',
    name: 'Furkan Akçay',
    role: 'Food and Drink Responsible',
    antiqueTitle: 'Keeper of the Feast',
  },
  {
    slug: 'hakki-erdem-gunal',
    name: 'Hakkı Erdem Günal',
    role: 'IT and Technical Responsible',
    antiqueTitle: 'Keeper of the Beacon Fires',
  },
  {
    slug: 'feyza-celiktas',
    name: 'Feyza Çeliktaş',
    role: 'Sustainability Responsible',
    antiqueTitle: 'Guardian of the Grove',
  },
  {
    slug: 'kerem-karaca',
    name: 'Kerem Karaca',
    role: 'Social Programme Responsible',
    antiqueTitle: 'Master of Revels',
  },
  {
    slug: 'eslem-sahin',
    name: 'Eslem Şahin',
    role: 'Venue and Accommodation Responsible',
    antiqueTitle: 'Keeper of Xenia',
  },
  {
    slug: 'sudenur-babayigit',
    name: 'Sudenur Babayiğit',
    role: 'Partnership and Institutional Responsible',
    antiqueTitle: 'Envoy to the Cities',
  },
  {
    slug: 'efe-erdogan',
    name: 'Efe Erdoğan',
    role: 'Volunteer Responsible',
    antiqueTitle: 'Marshal of the Myrmidons',
  },
  {
    slug: 'caitlyn-bladen',
    name: 'Caitlyn Bladen',
    role: 'Safety Responsible',
    antiqueTitle: 'Watcher on the Walls',
  },
  {
    slug: 'mustafa-hanefi-toygar',
    name: 'Mustafa Hanefi Toygar',
    role: 'Safety Responsible',
    antiqueTitle: 'Watcher on the Walls',
  },
  {
    slug: 'betul-kurban',
    name: 'Betül Kurban',
    role: 'Advisor',
    antiqueTitle: 'Elder of the Council',
  },
  {
    slug: 'merve-ceylan',
    name: 'Merve Ceylan',
    role: 'Advisor',
    antiqueTitle: 'Elder of the Council',
  },
]
