import { Section } from '@/components/Section'
import { skillGroups } from '@/content/skills'

export function Skills() {
  return (
    <Section id="skills" index="04 — Skills" title="Instrument readings">
      <div className="grid gap-x-16 gap-y-14 md:grid-cols-2" data-skills-board>
        {skillGroups.map((group) => (
          <div key={group.label}>
            <p className="telemetry mb-6 text-[10px] text-ink-faint">{group.label}</p>
            <ul className="space-y-5">
              {group.skills.map((skill) => (
                <li key={skill.name} className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-4">
                  <span className="truncate text-sm text-ink-mute">{skill.name}</span>
                  <span
                    className="relative h-px bg-hairline"
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={skill.level}
                    aria-label={`${skill.name} proficiency`}
                  >
                    <span
                      data-gauge-fill
                      className="absolute inset-y-0 left-0 origin-left bg-gold"
                      style={{ width: `${skill.level}%` }}
                    />
                  </span>
                  <span
                    data-gauge-value={skill.level}
                    className="telemetry text-right text-[11px] text-ink-mute"
                  >
                    {skill.level}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
