# Portfolio Design Blueprint

## Product Goal
Create a cinematic, interactive portfolio for **Vishruth Meda** that feels modern and technically strong while remaining professional for internships, startup roles, and engineering/research opportunities.

## Audience
- Recruiters scanning quickly for skills, projects, and impact.
- Technical interviewers evaluating engineering depth and implementation choices.
- Collaborators/mentors interested in initiative, ownership, and product thinking.

## Content Source
Primary content is derived from `vishruth.meda.resume.pdf` in this workspace.

## Information Architecture

1. **Hero (Immediate Impact)**
2. **About / Profile Snapshot**
3. **Experience Journey (Chaptered Timeline)**
4. **Selected Projects**
5. **Skills / Certifications / Coursework**
6. **Contact CTA**

## Visual Direction

- **Theme**: Tech-forward cinematic editorial.
- **Typography**:
  - Display: `Syne` (high personality, bold headings)
  - Body/UI: `Manrope` (clean readability)
- **Color System**:
  - `--bg-0`: Deep navy
  - `--bg-1`: Slate blue
  - `--accent-0`: Electric cyan
  - `--accent-1`: Warm orange
  - `--text-0`: Off-white
  - `--text-muted`: Cool gray-blue
- **Background**:
  - Layered radial gradients
  - Grain/noise overlay
  - Interactive WebGL hero object

## Interaction & Motion Blueprint

### Global Motion
- Lenis smooth scrolling for continuity.
- GSAP ScrollTrigger for section entry, pinning, and timeline scrubbing.
- `prefers-reduced-motion` fallback to reduced or disabled nonessential animation.

### Section-Level Motion
- Hero: camera/object response to pointer movement + subtle idle drift.
- Chapter transitions: staged opacity + y-offset reveal.
- Experience timeline: progressive activation and depth shift.
- Projects: horizontal narrative card sequence with scrub.
- CTA: magnetic button and micro spring interactions.

### Navigation
- Fixed vertical progress HUD.
- Active section highlighting.
- Click-to-scroll section jumps.
- Header anchors with smooth scroll.

## Technical Blueprint

- **Tooling**: Vite
- **Rendering**: Three.js
- **Animation**: GSAP + ScrollTrigger
- **Scroll Engine**: Lenis
- **Structure**:
  - `index.html`: semantic sections + app shell
  - `src/main.js`: orchestration, interactions, timelines
  - `src/style.css`: design system + responsive styles
  - `src/data/resume.js`: structured resume content

## Resume-to-Section Mapping

- **Education**: UT Austin CS Freshman; Medical AI team context.
- **Startup / Intern Work**: Finance Wizard startup and mobile/Xcode expansion.
- **Research**: Enemy AI research with UE5 and behavior systems.
- **AI Training**: UTD AI Deep Dive and model/toolchain breadth.
- **Project Leadership**: ASL translator (97% model) and game dev team leadership.
- **Work Experience**: Swim instructor/lifeguard/front desk and P1 Games volunteering.
- **Skills**: Java, Python, Swift, C++, UE, React, Firebase, Git, TensorFlow, etc.
- **Credentials**: Certiport + CS50/MIT/FreeCodeCamp course stack.

## Professionalism Validation Rules

For each feature:
1. Must support readability and confidence.
2. Must keep content scannable in under 60 seconds.
3. Must not hide key achievements behind heavy motion.
4. Must degrade gracefully on mobile and reduced-motion devices.
5. Must avoid direct imitation of reference site branding/copy/assets.

## Quality Gates Before Delivery

1. Build passes (`npm run build`).
2. No blocking console errors in dev mode.
3. Responsive layout tested at mobile/tablet/desktop breakpoints.
4. Keyboard navigation remains usable for core interactions.
5. Hero and major section transitions maintain > 50 FPS on mainstream hardware (qualitative check).
