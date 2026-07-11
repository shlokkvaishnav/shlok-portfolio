import type { ExperienceEntry } from './types'

export const experience: readonly ExperienceEntry[] = [
  {
    id: 'bull-agritech',
    start: 'APR 2026',
    end: null,
    role: 'Software Development Intern',
    org: 'Bull Agritech',
    summary:
      'Building a crop-classification system that maps castor fields from multispectral satellite imagery — deep-learning segmentation with geospatial post-processing to estimate planted acreage across farm boundaries.',
    highlights: [
      'Built a segmentation pipeline over multispectral satellite imagery to detect castor fields across heterogeneous farm boundaries.',
      'Combined deep-learning inference with geospatial post-processing (polygonization, area aggregation) to estimate planted acreage.',
      'Handled seasonal spectral variation with vegetation-index features (NDVI-family) alongside raw bands.',
      'Packaged the workflow so new imagery batches can be processed end-to-end without manual steps.',
    ],
    epoch: { label: 'Now', stamp: 't + 13.8 Gyr · present epoch' },
  },
  {
    id: 'isro-fellowship',
    start: 'FEB 2026',
    end: null,
    role: 'Undergraduate Research Fellow',
    org: 'CSE Dept, Nirma University · ISRO-funded',
    summary:
      'Morphometric analysis of lunar impact craters: processing Chandrayaan DEM data to extract depth, diameter, and degradation parameters at scale.',
    highlights: [
      'Processing Chandrayaan digital elevation models to extract crater morphometry: depth, diameter, d/D ratio, and rim degradation state.',
      'Automating profile extraction across crater populations instead of hand-measuring individual features.',
      'Working under an ISRO-funded project within the CSE department, bridging planetary science questions and software tooling.',
    ],
    epoch: { label: 'Research', stamp: 't + 13.7 Gyr · cratered worlds' },
  },
  {
    id: 'ds-club',
    start: 'SEP 2025',
    end: null,
    role: 'Technical Team Member',
    org: 'Data Science Club, Nirma',
    summary:
      'Delivered machine-learning workshops to 60+ students, co-organized HACKaMINeD 2026 with 1,000+ participants, and run bi-weekly Kaggle sessions.',
    highlights: [
      'Designed and delivered hands-on ML workshops for 60+ students, from data wrangling through model evaluation.',
      'Co-organized HACKaMINeD 2026 with 1,000+ participants — logistics, problem statements, and judging support.',
      'Run bi-weekly Kaggle sessions building competition instincts: feature engineering, validation discipline, leaderboard hygiene.',
    ],
    epoch: { label: 'First teams', stamp: 't + 13.6 Gyr · clusters form' },
  },
  {
    id: 'ieee-cs',
    start: 'SEP 2025',
    end: null,
    role: 'Promotions & Publications Head',
    org: 'IEEE Computer Society, Nirma',
    summary:
      'Coordinated AI workshops with Google Cloud India and ran outreach campaigns for events including the IEEE Carnival.',
    highlights: [
      'Coordinated AI workshops in collaboration with Google Cloud India, owning promotion and attendee communication.',
      'Built repeatable promotional workflows (design → schedule → publish) used across society events.',
      'Ran multi-channel campaigns for flagship events including the IEEE Carnival.',
    ],
    epoch: { label: 'Ignition', stamp: 't + 13.6 Gyr · first light' },
  },
]
