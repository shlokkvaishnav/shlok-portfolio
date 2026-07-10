import { ScrollSystem } from '@/animation/ScrollSystem'
import { BracketOverlay } from '@/components/BracketOverlay'
import { Nav } from '@/components/Nav'
import { ProgressRail } from '@/components/ProgressRail'
import { Footer } from '@/components/Footer'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Experience } from '@/sections/Experience'
import { Projects } from '@/sections/Projects'
import { Skills } from '@/sections/Skills'
import { Contact } from '@/sections/Contact'

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="telemetry sr-only z-50 bg-void px-4 py-3 text-xs text-gold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <ScrollSystem />
      <BracketOverlay />
      <Nav />
      <ProgressRail />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
