import type { SocialLink } from './types'

export const site = {
  name: 'Shlok Vaishnav',
  role: 'Software Engineer',
  kicker: 'Software Engineer — ML & Systems',
  positioning:
    'I design systems that hold up under real use — from SIMD-tuned vector search to satellite-imagery pipelines.',
  about: [
    'I am a computer science undergraduate at Nirma University working across machine learning and systems engineering. The work I care about sits where the two meet: research ideas made fast, reliable, and deployable.',
    'Right now that means mapping castor fields from multispectral satellite imagery at Bull Agritech, and extracting the shape parameters of lunar impact craters from Chandrayaan DEM data on an ISRO-funded research fellowship.',
    'Off the clock I build engines from scratch — a persistent vector database in C++, an agent that rediscovers physics equations — because the fastest way to understand a system is to implement it.',
  ],
  education: {
    institution: 'Nirma University',
    program: 'B.Tech, Computer Science & Engineering',
    location: 'Ahmedabad, India',
  },
  email: 'shlok9640@gmail.com',
  availability: 'Open to internships and research collaborations.',
  url: 'https://shlokkvaishnav.dev',
} as const

export const socials: readonly SocialLink[] = [
  { label: 'GitHub', handle: 'shlokkvaishnav', href: 'https://github.com/shlokkvaishnav' },
  { label: 'LinkedIn', handle: 'in/shlok-vaishnav', href: 'https://linkedin.com/in/shlok-vaishnav' },
  { label: 'X', handle: '@shlokkvaishnav', href: 'https://twitter.com/shlokkvaishnav' },
]

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof navItems)[number]['id'] | 'hero'
