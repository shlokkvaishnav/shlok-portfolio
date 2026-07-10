import type { Project } from './types'

export const projects: readonly Project[] = [
  {
    id: 'nanodb',
    title: 'NanoDB',
    tagline: 'Persistent vector search engine, from scratch',
    description:
      'A disk-based vector search engine in C++: HNSW indexing that survives restarts, AVX2-accelerated distance kernels, multi-threaded insertion, and Python bindings.',
    tags: ['C++', 'SIMD', 'HNSW', 'Python'],
    year: '2025',
    category: 'Systems',
    status: 'Active',
    github: 'https://github.com/shlokkvaishnav/nano-db',
    demo: null,
    exhibit: 'nanodb',
  },
  {
    id: 'climate-equation-discovery',
    title: 'Climate Equation Discovery',
    tagline: 'An agent that rediscovers the physics of climate',
    description:
      'An autonomous agent that discovers physics-validated climate equations — symbolic regression guided by dynamic memory pruning and Bayesian regime tracking.',
    tags: ['Python', 'Symbolic AI', 'PySR'],
    year: '2025',
    category: 'Research',
    status: 'Active',
    github: 'https://github.com/shlokkvaishnav/climate-equation-discovery',
    demo: null,
    exhibit: 'climate',
  },
  {
    id: 'meridian-analytics',
    title: 'Meridian Analytics',
    tagline: 'Engineering intelligence without surveillance',
    description:
      'A privacy-focused engineering intelligence platform: surfaces PR bottlenecks, tracks team velocity, and flags burnout risk before it lands.',
    tags: ['TypeScript', 'ML', 'React', 'Node.js'],
    year: '2025',
    category: 'Product',
    status: 'Live',
    github: 'https://github.com/shlokkvaishnav/meridian-analytics',
    demo: 'https://meridian-analytics.vercel.app',
    exhibit: 'meridian',
  },
  {
    id: 'cardiovascular-risk',
    title: 'Cardiovascular Risk',
    tagline: 'Heart-disease prediction, production-grade',
    description:
      'A production-grade ML system for heart-disease prediction: modular ETL pipeline, FastAPI inference service, MLflow experiment tracking, and Docker-ready deployment.',
    tags: ['Python', 'FastAPI', 'MLOps', 'Docker'],
    year: '2024',
    category: 'MLOps',
    status: 'Live',
    github: 'https://github.com/shlokkvaishnav/cardiovascular-risk',
    demo: 'https://cardiovascular-risk.vercel.app',
    exhibit: 'cardio',
  },
]

/**
 * Fixed x-positions (0–1) for spectrum-strip tags so a technology sits at the
 * same wavelength on every card it appears in.
 */
export const SPECTRUM_INDEX: Record<string, number> = {
  'C++': 0.08,
  SIMD: 0.16,
  HNSW: 0.24,
  Python: 0.34,
  'Symbolic AI': 0.42,
  PySR: 0.5,
  TypeScript: 0.58,
  ML: 0.66,
  React: 0.72,
  'Node.js': 0.78,
  FastAPI: 0.86,
  MLOps: 0.92,
  Docker: 0.97,
}
