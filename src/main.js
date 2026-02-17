import "./style.css";
import "./lightweight.css";
import "./portal.css";
import { resumeData } from "./data/resume";
import { projectRealmOrder, projectRealms } from "./data/project-realms";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;


// =========================================================
//  2. DATA POPULATION
// =========================================================

function populateProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  // Subtle dark-theme gradients for project visuals
  const gradients = [
    "linear-gradient(135deg, rgba(80,140,255,0.15) 0%, rgba(120,80,200,0.1) 100%)",
    "linear-gradient(135deg, rgba(255,100,130,0.12) 0%, rgba(200,60,120,0.08) 100%)",
    "linear-gradient(135deg, rgba(60,180,255,0.15) 0%, rgba(0,200,200,0.1) 100%)",
    "linear-gradient(135deg, rgba(60,220,130,0.12) 0%, rgba(50,200,180,0.08) 100%)"
  ];

  resumeData.projects.forEach((project, index) => {
    const realm = projectRealms[projectRealmOrder[index]];

    const card = document.createElement("article");
    card.className = "lw-project-card lw-reveal";

    // Visual circle with subtle gradient
    const visual = document.createElement("div");
    visual.className = "lw-card-visual";
    visual.style.background = gradients[index % gradients.length];
    visual.style.border = "1px solid rgba(255,255,255,0.08)";

    const number = document.createElement("span");
    number.className = "lw-card-number";
    number.textContent = String(index + 1).padStart(2, "0");
    number.style.color = "rgba(255,255,255,0.06)";
    visual.appendChild(number);

    // Content
    const title = document.createElement("h3");
    title.className = "lw-card-title";
    title.textContent = project.name;

    const desc = document.createElement("p");
    desc.className = "lw-card-desc";
    desc.textContent = project.summary;

    const link = document.createElement("a");
    link.className = "lw-card-link";
    link.textContent = "View Project →";
    link.href = realm ? realm.path : "#";

    card.appendChild(visual);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(link);

    // Click entire card to navigate
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "A") return;
      if (realm) window.location.href = realm.path;
    });

    grid.appendChild(card);
  });
}

function populateExperience() {
  const container = document.getElementById("experience-list");
  if (!container) return;

  resumeData.experiences.forEach((exp) => {
    const row = document.createElement("div");
    row.className = "lw-exp-row lw-reveal";

    const time = document.createElement("div");
    time.className = "lw-exp-time";
    time.textContent = exp.timeframe;

    const content = document.createElement("div");

    const title = document.createElement("h3");
    title.className = "lw-exp-title";
    title.textContent = exp.title;

    const role = document.createElement("div");
    role.className = "lw-exp-role";
    role.textContent = `${exp.role} — ${exp.category}`;

    const list = document.createElement("ul");
    list.className = "lw-exp-highlights";
    exp.highlights.slice(0, 3).forEach((h) => {
      const li = document.createElement("li");
      li.textContent = h;
      list.appendChild(li);
    });

    content.appendChild(title);
    content.appendChild(role);
    content.appendChild(list);

    row.appendChild(time);
    row.appendChild(content);
    container.appendChild(row);
  });
}

function populateSkills() {
  const cloud = document.getElementById("skills-cloud");
  if (!cloud) return;

  resumeData.skills.tools.forEach((tool) => {
    const chip = document.createElement("span");
    chip.textContent = tool;
    chip.style.cssText = `
      display: inline-block;
      padding: 0.4rem 0.9rem;
      border: 1px solid rgba(255,255,255,0.15);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.7;
    `;
    cloud.appendChild(chip);
  });
}

function populateContact() {
  const emailCta = document.getElementById("email-cta");
  if (emailCta) emailCta.href = `mailto:${resumeData.email}`;

  const locationEl = document.getElementById("hud-location");
  if (locationEl) locationEl.textContent = `Loc: ${resumeData.location}`;
}

// =========================================================
//  3. SMOOTH SCROLLING
// =========================================================

function initSmoothScroll() {
  if (prefersReducedMotion) return null;

  const lenis = new Lenis({
    smoothWheel: true,
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on("scroll", ScrollTrigger.update);

  // Anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -40, duration: 1.4 });
      }
    });
  });

  return lenis;
}

// =========================================================
//  4. GSAP REVEAL ANIMATIONS
// =========================================================

function setupRevealAnimations() {
  // Hero elements — staggered intro
  const heroItems = gsap.utils.toArray("#hero .lw-reveal");
  gsap.fromTo(
    heroItems,
    { y: 80, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out",
      delay: 0.3
    }
  );

  // Scroll-triggered reveals for all other sections
  gsap.utils.toArray(".lw-reveal").forEach((el) => {
    if (el.closest("#hero")) return; // skip hero items
    gsap.fromTo(
      el,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true
        }
      }
    );
  });

  // Project cards — stagger within grid
  const projectCards = gsap.utils.toArray(".lw-project-card");
  if (projectCards.length) {
    gsap.fromTo(
      projectCards,
      { y: 80, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#projects-grid",
          start: "top 85%",
          once: true
        }
      }
    );
  }

  // Parallax on section headings
  if (!prefersReducedMotion) {
    gsap.utils.toArray(".lw-heading-section").forEach((heading) => {
      gsap.fromTo(
        heading,
        { y: 40 },
        {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: heading,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        }
      );
    });
  }
}

// =========================================================
//  5. SCROLL MARKERS
// =========================================================

function setupScrollMarkers() {
  const markers = document.querySelectorAll(".lw-marker-item");

  markers.forEach((marker) => {
    const targetId = marker.dataset.target;
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      ScrollTrigger.create({
        trigger: targetSection,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) {
            markers.forEach((m) => m.classList.remove("active"));
            marker.classList.add("active");
          }
        }
      });

      marker.addEventListener("click", () => {
        targetSection.scrollIntoView({ behavior: "smooth" });
      });
    }
  });
}

// =========================================================
//  6. TEXT RIPPLE GLOW — Water-wave style
//     Cursor movement sends adaptive, smooth character waves
//     outward through text. Wave size scales with font size
//     so the visual splash feels consistent everywhere.
// =========================================================

function setupTextRippleGlow() {
  if (prefersReducedMotion || !finePointer) return;

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&!?+/";
  // Wave count is now adaptive — these are the bounds
  const WAVE_MIN_CHARS = 12;     // chars for the largest text (~100px+)
  const WAVE_MAX_CHARS = 50;     // chars for the smallest text (~14px)
  const WAVE_REFERENCE_SIZE = 16; // px — font size that maps to WAVE_MAX_CHARS
  const WAVE_LARGE_SIZE = 80;    // px — font size that maps to WAVE_MIN_CHARS

  const SCRAMBLE_DURATION = 160;  // ms — shorter so chars don't feel stuck
  const DELAY_PER_RANK = 12;     // ms delay between each character rank (tighter = smoother)
  const MOVE_THRESHOLD = 70;     // px cursor must move to fire a new wave (higher = less sensitive)
  const GLOW_LINGER = 1200;      // ms — how long the afterglow lasts before fading

  // ---- Collect ALL visible text in #main-content ----
  const textRoot = document.getElementById("main-content");
  if (!textRoot) return;

  const allTextEls = textRoot.querySelectorAll(
    "h1, h2, h3, p, span, a, li, strong, em, div"
  );

  const chars = []; // { el, original, state, lastTriggered, fontSize }

  const splitElement = (el) => {
    if (el.dataset.glowSplit) return;
    if (el.children.length > 0 && el.textContent.trim() === "") return;
    if (el.querySelector(".lw-glow-char")) return;

    el.dataset.glowSplit = "true";

    // Cache computed font size for this element
    const fontSize = parseFloat(window.getComputedStyle(el).fontSize) || 16;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((textNode) => {
      if (!textNode.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      const text = textNode.textContent;
      const newChars = []; // track spans we create in this batch
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") {
          frag.appendChild(document.createTextNode(ch));
        } else {
          const span = document.createElement("span");
          span.className = "lw-glow-char";
          span.textContent = ch;
          // Add smooth CSS transitions for glow fade-in/out
          span.style.transition = "color 150ms ease, text-shadow 200ms ease";
          span.style.display = "inline-block";
          frag.appendChild(span);
          const charObj = {
            el: span,
            original: ch,
            scrambleId: 0,
            fontSize
          };
          chars.push(charObj);
          newChars.push(charObj);
        }
      }
      textNode.parentNode.replaceChild(frag, textNode);

      // Lock each span's width to its natural size so glyph swaps
      // never cause layout shifts
      for (const c of newChars) {
        c.el.style.width = c.el.offsetWidth + "px";
        c.el.style.textAlign = "center";
      }
    });
  };

  allTextEls.forEach((el) => {
    if (el.children.length === 0 || el.matches("a, li, strong, em, span, p, h1, h2, h3")) {
      splitElement(el);
    }
  });

  // ---- Compute adaptive wave char count from font size ----
  const getWaveCount = (fontSize) => {
    const t = Math.min(1, Math.max(0,
      (fontSize - WAVE_REFERENCE_SIZE) / (WAVE_LARGE_SIZE - WAVE_REFERENCE_SIZE)
    ));
    return Math.round(WAVE_MAX_CHARS + t * (WAVE_MIN_CHARS - WAVE_MAX_CHARS));
  };

  // ---- Scramble one char — supports unlimited overlapping waves ----
  //      scrambleId is bumped INSIDE the delay so the old animation
  //      keeps running until the new one is actually ready to start.
  const scrambleChar = (c, delay, rank, totalChars) => {
    setTimeout(() => {
      // Bump version now — old animation's next flicker check will see the mismatch and stop
      const myId = ++c.scrambleId;

      // Reset transition to instant for the scramble phase
      c.el.style.transition = "none";

      let flicks = 0;
      const maxFlicks = 2 + Math.floor(Math.random() * 2); // 2-3 flickers (fast)
      const interval = SCRAMBLE_DURATION / maxFlicks;

      const flicker = () => {
        if (c.scrambleId !== myId) return;

        if (flicks < maxFlicks) {
          c.el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          // Blue glow during scramble
          c.el.style.color = "rgba(120, 180, 255, 1)";
          c.el.style.textShadow = "0 0 12px rgba(80, 150, 255, 0.9), 0 0 25px rgba(60, 120, 255, 0.4)";
          flicks++;
          setTimeout(flicker, interval);
        } else if (c.scrambleId === myId) {
          // Revert text, then enter gray afterglow phase
          c.el.textContent = c.original;
          c.el.style.transition = `color ${GLOW_LINGER}ms ease-out, text-shadow ${GLOW_LINGER}ms ease-out`;
          c.el.style.color = "rgba(210, 215, 225, 1)";
          c.el.style.textShadow = "0 0 8px rgba(180, 190, 210, 0.5), 0 0 18px rgba(160, 170, 195, 0.2)";

          // After a brief hold, fade back to default
          setTimeout(() => {
            if (c.scrambleId !== myId) return;
            c.el.style.color = "";
            c.el.style.textShadow = "";
            // Restore fast transition for next scramble
            setTimeout(() => {
              c.el.style.transition = "color 150ms ease, text-shadow 200ms ease";
            }, GLOW_LINGER);
          }, 300);
        }
      };
      flicker();
    }, delay);
  };

  // ---- Get char distances from a point, sorted ----
  const getNearest = (x, y, count) => {
    const scored = [];
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      const rect = c.el.getBoundingClientRect();
      // Skip off-screen chars for performance
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      scored.push({ c, dist });
    }
    scored.sort((a, b) => a.dist - b.dist);
    return scored.slice(0, count);
  };

  // ---- Trigger a wave from cursor position ----
  const triggerWave = (x, y) => {
    // Detect font size of the nearest char to determine adaptive wave count
    const probe = getNearest(x, y, 1);
    if (probe.length === 0) return;
    const fontSize = probe[0].c.fontSize;
    const waveCount = getWaveCount(fontSize);
    const glowCount = Math.round(waveCount * 1.5);

    const nearest = getNearest(x, y, waveCount);
    for (let rank = 0; rank < nearest.length; rank++) {
      const { c } = nearest[rank];
      const delay = rank * DELAY_PER_RANK;
      scrambleChar(c, delay, rank, waveCount);
    }
  };

  // ---- Mouse tracking ----
  let mouseX = -9999, mouseY = -9999;
  let lastWaveX = -9999, lastWaveY = -9999;

  document.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Fire a new wave every MOVE_THRESHOLD px of cursor travel
    const moveDist = Math.hypot(mouseX - lastWaveX, mouseY - lastWaveY);
    if (moveDist > MOVE_THRESHOLD) {
      triggerWave(mouseX, mouseY);
      lastWaveX = mouseX;
      lastWaveY = mouseY;
    }
  });

  // ---- Ambient glow that follows cursor (adaptive count) ----
  const updateGlow = () => {
    // Only compute if mouse is on-screen
    if (mouseX < -999) {
      for (let i = 0; i < chars.length; i++) {
        chars[i].el.style.textShadow = "";
      }
      requestAnimationFrame(updateGlow);
      return;
    }

    // Adaptive glow count based on nearest char font size
    const probe = getNearest(mouseX, mouseY, 1);
    const fontSize = probe.length > 0 ? probe[0].c.fontSize : 16;
    const glowCount = Math.round(getWaveCount(fontSize) * 1.5);

    const glowChars = getNearest(mouseX, mouseY, glowCount);
    const glowSet = new Set(glowChars.map(g => g.c));

    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];


      if (glowSet.has(c)) {
        const rank = glowChars.findIndex(g => g.c === c);
        const intensity = 1 - rank / glowCount;
        const alpha = (intensity * 0.3).toFixed(2);
        c.el.style.textShadow = `0 0 8px rgba(220, 230, 255, ${alpha})`;
      } else {
        c.el.style.textShadow = "";
      }
    }
    requestAnimationFrame(updateGlow);
  };
  requestAnimationFrame(updateGlow);

  document.addEventListener("mouseleave", () => {
    mouseX = -9999;
    mouseY = -9999;
    lastWaveX = -9999;
    lastWaveY = -9999;
  });
}

// =========================================================
//  7. CUSTOM CURSOR
// =========================================================

function setupCustomCursor() {
  if (prefersReducedMotion || !finePointer) return;

  const shell = document.querySelector(".lw-cursor-shell");
  const ring = shell?.querySelector(".lw-cursor-ring");
  const dot = shell?.querySelector(".lw-cursor-dot");
  if (!shell || !ring || !dot) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0;

  const interactiveSelector = "a, button, .lw-project-card, .lw-marker-item, .lw-btn";

  const tick = () => {
    curX += (targetX - curX) * 0.15;
    curY += (targetY - curY) * 0.15;
    ring.style.left = `${curX}px`;
    ring.style.top = `${curY}px`;
    dot.style.left = `${curX}px`;
    dot.style.top = `${curY}px`;
    requestAnimationFrame(tick);
  };
  tick();

  document.addEventListener("pointermove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    shell.classList.add("active");
  });

  document.addEventListener("pointerover", (e) => {
    if (e.target.closest(interactiveSelector)) {
      shell.classList.add("engaged");
    } else {
      shell.classList.remove("engaged");
    }
  });

  document.addEventListener("mouseleave", () => {
    shell.classList.remove("active", "engaged");
  });
}

// =========================================================
//  8. MAGNETIC BUTTONS
// =========================================================

function setupMagneticButtons() {
  if (prefersReducedMotion || !finePointer) return;

  document.querySelectorAll(".lw-btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
    });

    btn.addEventListener("pointerleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    });
  });
}

// =========================================================
//  9. INITIALIZATION
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Populate data
  populateProjects();
  populateExperience();
  populateSkills();
  populateContact();

  // Setup systems
  initSmoothScroll();
  setupScrollMarkers();
  setupRevealAnimations();
  setupCustomCursor();
  setupMagneticButtons();
  setupTextRippleGlow();

  // Refresh triggers after data population
  ScrollTrigger.refresh();
});
