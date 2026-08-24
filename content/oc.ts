/**
 * The sixteen Organising Committee members, in the order they hang on the wall.
 *
 * `portrait` points at public/portraits/<slug>.png. A missing file is expected
 * and handled — the frame renders empty with the label intact, so portraits can
 * arrive one at a time. See docs/art-direction.md.
 */

export type OcMember = {
  slug: string
  name: string
  role: string
}

export const oc: OcMember[] = [
  {
    slug: 'burcu-ozdemir',
    name: 'Burcu Özdemir',
    role: 'Head of the OC',
  },
  {
    slug: 'berkay-kiran',
    name: 'Berkay Kıran',
    role: 'Vice Head of the OC · Internal Relations',
  },
  {
    slug: 'furkan-ucar',
    name: 'Furkan Uçar',
    role: 'Vice Head of the OC · External Relations',
  },
  {
    slug: 'cagatay-cavus',
    name: 'Çağatay Çavuş',
    role: 'Financial Responsible',
  },
  {
    slug: 'ece-dikbiyik',
    name: 'Ece Dikbıyık',
    role: 'Communication Responsible',
  },
  {
    slug: 'furkan-akcay',
    name: 'Furkan Akçay',
    role: 'Food and Drink Responsible',
  },
  {
    slug: 'hakki-erdem-gunal',
    name: 'Hakkı Erdem Günal',
    role: 'IT and Technical Responsible',
  },
  {
    slug: 'feyza-celiktas',
    name: 'Feyza Çeliktaş',
    role: 'Sustainability Responsible',
  },
  {
    slug: 'kerem-karaca',
    name: 'Kerem Karaca',
    role: 'Social Programme Responsible',
  },
  {
    slug: 'eslem-sahin',
    name: 'Eslem Şahin',
    role: 'Venue and Accommodation Responsible',
  },
  {
    slug: 'sudenur-babayigit',
    name: 'Sudenur Babayiğit',
    role: 'Partnership and Institutional Responsible',
  },
  {
    slug: 'efe-erdogan',
    name: 'Efe Erdoğan',
    role: 'Volunteer Responsible',
  },
  {
    slug: 'caitlyn-bladen',
    name: 'Caitlyn Bladen',
    role: 'Safety Responsible',
  },
  {
    slug: 'mustafa-hanefi-toygar',
    name: 'Mustafa Hanefi Toygar',
    role: 'Safety Responsible',
  },
  {
    slug: 'betul-kurban',
    name: 'Betül Kurban',
    role: 'Advisor',
  },
  {
    slug: 'merve-ceylan',
    name: 'Merve Ceylan',
    role: 'Advisor',
  },
]
