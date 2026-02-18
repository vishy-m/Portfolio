/**
 * Main entry point — orchestrates all subsystems.
 *
 * Each concern lives in its own module; this file simply
 * imports them and wires them together on DOMContentLoaded.
 */

import "./style.css";
import "./lightweight.css";

import { populateProjects, populateExperience, populateSkills, populateContact } from "./populate";
import { initSmoothScroll, setupRevealAnimations, setupScrollMarkers, ScrollTrigger } from "./animations";
import { setupTextRipple } from "./text-ripple";
import { setupCustomCursor, setupMagneticButtons } from "./cursor";

// ── Bootstrap ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // 1. Populate data-driven DOM
  populateProjects();
  populateExperience();
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

  // 4. Refresh GSAP triggers after dynamic content
  ScrollTrigger.refresh();
});
