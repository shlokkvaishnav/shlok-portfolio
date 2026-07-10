import type { SkillGroup } from './types'

export const skillGroups: readonly SkillGroup[] = [
  {
    label: 'Languages',
    skills: [
      { name: 'C++', level: 88 },
      { name: 'Python', level: 85 },
      { name: 'JavaScript', level: 80 },
      { name: 'SQL', level: 75 },
    ],
  },
  {
    label: 'ML & Research',
    skills: [
      { name: 'Machine Learning', level: 88 },
      { name: 'Computer Vision', level: 85 },
      { name: 'Deep Learning', level: 82 },
      { name: 'PyTorch', level: 78 },
    ],
  },
  {
    label: 'Web',
    skills: [
      { name: 'React', level: 80 },
      { name: 'Tailwind', level: 78 },
      { name: 'Node.js', level: 75 },
      { name: 'Next.js', level: 72 },
    ],
  },
  {
    label: 'Tools',
    skills: [
      { name: 'Git', level: 90 },
      { name: 'Linux', level: 78 },
      { name: 'Docker', level: 72 },
      { name: 'GCP', level: 68 },
    ],
  },
]
