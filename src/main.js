/**
 * Main entry point — orchestrates all subsystems.
 *
 * Each concern lives in its own module; this file simply
 * imports them and wires them together on DOMContentLoaded.
 */

import "./style.css";
import "./lightweight.css";

import { populateProjects, populateAbout, populateSkills, populateContact } from "./populate";
import { initSmoothScroll, setupRevealAnimations, setupScrollMarkers, ScrollTrigger } from "./animations";
import { setupTextRipple } from "./text-ripple";
import { setupCustomCursor, setupMagneticButtons } from "./cursor";
import { setupPageTransitions, revealAfterTransition } from "./page-transition";

// ── Bootstrap ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // 1. Populate data-driven DOM
  populateProjects();
  populateAbout();
  populateSkills();
  populateContact();

  // 2. Animations & scroll
  initSmoothScroll();
  setupScrollMarkers();
  setupRevealAnimations();

  // 3. Interactive effects
  setupCustomCursor();
  setupMagneticButtons();
  setupTextRipple();
  setupPageTransitions();

  // 4. Refresh GSAP triggers after dynamic content
  ScrollTrigger.refresh();

  // 5. Reveal page (prevents FOUC) + play transition if arriving from another page
  document.body.style.opacity = "1";
  revealAfterTransition();
});
