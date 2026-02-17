# Portfolio Feature Matrix

This matrix maps observed interaction patterns from the analyzed references to a professional portfolio implementation for **Vishruth Meda**.

## Scoring Legend
- `Similarity`: How directly the proposed feature is inspired by analyzed references.
- `Interactivity/Fun`: User engagement value.
- `Professional Fit`: Suitability for recruiter, startup, and technical audiences.
- Scale: `Low / Medium / High`.

| Feature | Reference Influence | Planned Portfolio Adaptation | Similarity | Interactivity/Fun | Professional Fit | Guardrails |
|---|---|---|---|---|---|---|
| Interactive 3D Hero Scene | KODE Immersive, Lusion v3 | Landing hero with WebGL object reacting to pointer movement and subtle drag momentum. | High | High | High | Keep object abstract/brand-safe, avoid gimmicky game mechanics in hero. |
| Cinematic Scroll Chapters | Sculpting Harmony, Hatom | Chapter-like section transitions with progressive reveals and section state changes. | High | High | High | Use clear section labels and readable copy to stay recruiter-friendly. |
| Smooth Scroll System | Hatom, Lions Good News 2020 | Lenis-based smooth scroll for continuity of motion and improved perceived polish. | Medium | Medium | High | Respect reduced-motion preferences and preserve native accessibility behavior. |
| Scroll Progress HUD | Hatom phase pagination, Gehry chapter anchors | Fixed right-side progress rail with active section indicators and click-to-jump support. | High | Medium | High | Keep indicators minimalist and always legible on mobile. |
| Scroll-Scrubbed Story Motion | Gehry chapter interaction, Cannes transitions | GSAP ScrollTrigger-powered parallax and timeline-scrub animations tied to section depth. | Medium | High | High | Control animation amplitude to avoid motion fatigue and seasickness. |
| Project Story Cards | Coastal World progression + editorial sequencing from Gehry | Project cards that animate in sequence with role, stack, and impact callouts. | Medium | Medium | High | Emphasize outcomes and technologies, not visual spectacle alone. |
| Skill Constellation Panel | KODE/Lusion interactive visual language | Animated skill chips and categorized competencies with hover depth and focus states. | Low | Medium | High | Keep the hierarchy scannable; avoid “tag cloud chaos”. |
| Magnetic CTA Interaction | KODE hover + UI micro-feedback patterns | Primary contact button with magnetic pointer attraction and spring feedback. | Medium | Medium | High | Limit effect radius and intensity to maintain control and clarity. |
| Ambient Motion & Depth | Lusion cinematic polish | Gradient atmospherics, moving grain/noise layers, and depth-aware transitions. | Medium | Medium | High | Keep contrast high and text unaffected by effects. |
| Audio Toggle (Optional) | KODE + Hatom “headphones” cues | Non-blocking audio toggle prepared in UI shell (muted default). | Medium | Low | Medium | Default off; no autoplay audio; no mandatory sound for UX completion. |
| Resume-Driven Information Architecture | Professional portfolio conventions + editorial storytelling references | Structured flow: Hero → About → Experience → Projects → Skills → Contact mapped from resume data. | Low | Medium | High | Prioritize factual correctness and recruiter skim-speed above novelty. |
| Mobile-First Responsive Interaction Design | Coastal/Hatom multi-input patterns | Pointer/touch parity for key interactions and adaptive motion levels by viewport. | Medium | Medium | High | Disable/scale heavy effects on low-power or small devices. |

## Feature Acceptance Checklist

Each implemented feature must pass all checks:

1. **Reference Similarity Check**: Inspired by reference behavior, not cloned assets, copy, or structure.
2. **Interactivity Check**: User input changes visual or navigational state meaningfully.
3. **Professionalism Check**: Improves clarity, confidence, or brand signal for career/recruiting context.
4. **Accessibility Check**: Keyboard navigation and reduced-motion handling remain intact.
5. **Performance Check**: No interaction should cause jank on mainstream laptop/mobile hardware.
