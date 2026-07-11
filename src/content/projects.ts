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
    caseStudy: {
      problem:
        'Vector databases are usually consumed as black boxes. I wanted to understand — and own — every layer: how approximate nearest-neighbor search actually works, why it is fast, and what it takes to make an index survive a process restart.',
      approach:
        'Implement HNSW from the paper up in modern C++, then make it production-shaped: persistence to disk instead of a memory-only toy, SIMD-accelerated distance kernels, and concurrent insertion so build time scales with cores.',
      architecture: [
        'Python bindings (pybind11)',
        'Query planner / top-k API',
        'HNSW graph — multi-threaded insert',
        'AVX2 distance kernels',
        'Disk-backed index storage',
      ],
      metrics: [
        ['Index', 'Disk-based HNSW, restart-safe'],
        ['Kernels', 'AVX2-vectorized distance ops'],
        ['Insertion', 'Multi-threaded graph build'],
        ['Interface', 'C++ core with Python bindings'],
      ],
      learnings:
        'Cache behavior dominates: the graph layout on disk mattered more than instruction-level tricks, and vectorized kernels only pay off once memory access patterns cooperate.',
    },
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
    caseStudy: {
      problem:
        'Symbolic regression can rediscover physical laws from data, but naive search drowns in candidate expressions and happily returns equations that fit numbers while violating physics.',
      approach:
        'An autonomous agent loop around PySR: generate candidate equations, validate them against physical constraints (units, limiting behavior), prune the memory of dead-end expression families dynamically, and track climate regimes with Bayesian updating so one equation isn’t forced to explain qualitatively different eras.',
      architecture: [
        'Climate observation datasets',
        'Symbolic regression engine (PySR)',
        'Physics-validation gate',
        'Dynamic memory pruning',
        'Bayesian regime tracker',
      ],
      metrics: [
        ['Search', 'Symbolic regression, agent-driven'],
        ['Validation', 'Physics-constraint gating'],
        ['Memory', 'Dynamic pruning of dead ends'],
        ['Regimes', 'Bayesian change tracking'],
      ],
      learnings:
        'The validation gate is the product: constraining the search space with physics beats any amount of extra compute spent exploring nonsense.',
    },
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
    caseStudy: {
      problem:
        'Engineering analytics tools tend to become surveillance: individual-level dashboards that erode trust while still failing to answer the useful question — where is the team actually stuck?',
      approach:
        'Aggregate first, privacy by design: model review relationships and PR flow at the team level, surface bottlenecks and silo risk as patterns rather than league tables, and flag burnout signals early instead of reporting them after the fact.',
      architecture: [
        'Git/PR data ingestion',
        'Team-level aggregation layer',
        'Bottleneck & silo detection (ML)',
        'Velocity & burnout signals',
        'React dashboard',
      ],
      metrics: [
        ['Focus', 'PR bottlenecks & review flow'],
        ['Privacy', 'Team-level, no individual scores'],
        ['Signals', 'Velocity trends, burnout risk'],
        ['Stack', 'TypeScript end to end'],
      ],
      learnings:
        'Framing decides adoption: the same data reads as help or as surveillance depending on the aggregation level you choose to expose.',
    },
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
    caseStudy: {
      problem:
        'Most ML class projects end at a notebook with a good AUC. The interesting work starts after that: making a model reproducible, testable, and deployable by someone who isn’t its author.',
      approach:
        'Treat the predictor as a product: a modular ETL pipeline with explicit validation stages, experiment tracking so every model version is reconstructible, and an inference service with the same interface in development and production.',
      architecture: [
        'Modular ETL & validation',
        'Training + MLflow tracking',
        'Model registry',
        'FastAPI inference service',
        'Docker deployment',
      ],
      metrics: [
        ['Pipeline', 'Modular ETL, testable stages'],
        ['Tracking', 'MLflow experiments & registry'],
        ['Serving', 'FastAPI, containerized'],
        ['Deploy', 'Docker-ready, live demo'],
      ],
      learnings:
        'Reproducibility is a feature you build, not a habit you promise — pinning the pipeline beat improving the model for real-world usefulness.',
    },
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
