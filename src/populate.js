/**
 * Data population — renders resume data into the DOM.
 *
 * Each function is idempotent: safe to call once on DOMContentLoaded.
 * All data comes from the central `resume` and `project-realms` data modules.
 */

import { resumeData } from "./data/resume";
import { projectRealmOrder, projectRealms } from "./data/project-realms";
import { navigateWithTransition } from "./page-transition";

// ── Subtle dark-theme gradients for project visuals ──────────────
const PROJECT_GRADIENTS = [
    "linear-gradient(135deg, rgba(80,140,255,0.15) 0%, rgba(120,80,200,0.1) 100%)",
    "linear-gradient(135deg, rgba(255,100,130,0.12) 0%, rgba(200,60,120,0.08) 100%)",
    "linear-gradient(135deg, rgba(60,180,255,0.15) 0%, rgba(0,200,200,0.1) 100%)",
    "linear-gradient(135deg, rgba(60,220,130,0.12) 0%, rgba(50,200,180,0.08) 100%)",
];

// ── Projects ─────────────────────────────────────────────────────
export function populateProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    projectRealmOrder.forEach((id, i) => {
        const realm = projectRealms[id];
        if (!realm) return;

        const card = document.createElement("article");
        card.className = "lw-project-card lw-reveal";

        // Visual circle
        const visual = document.createElement("div");
        visual.className = "lw-card-visual";
        visual.style.background = PROJECT_GRADIENTS[i % PROJECT_GRADIENTS.length];
        visual.style.border = "1px solid rgba(255,255,255,0.08)";

        const number = document.createElement("span");
        number.className = "lw-card-number";
        number.textContent = String(i + 1).padStart(2, "0");
        number.style.color = "rgba(255,255,255,0.06)";
        visual.appendChild(number);

        // Content
        const title = document.createElement("h3");
        title.className = "lw-card-title";
        title.textContent = realm.title;

        const desc = document.createElement("p");
        desc.className = "lw-card-desc";
        desc.textContent = realm.subtitle;

        const link = document.createElement("a");
        link.className = "lw-card-link";
        link.textContent = "View Project →";
        link.href = realm.path;

        card.append(visual, title, desc, link);

        card.addEventListener("click", (e) => {
            if (e.target.closest("a")) return;
            navigateWithTransition(realm.path);
        });

        grid.appendChild(card);
    });
}

// ── Experience ───────────────────────────────────────────────────
export function populateExperience() {
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

        content.append(title, role, list);
        row.append(time, content);
        container.appendChild(row);
    });
}

// ── Skills ───────────────────────────────────────────────────────
export function populateSkills() {
    const cloud = document.getElementById("skills-cloud");
    if (!cloud) return;

    resumeData.skills.tools.forEach((tool) => {
        const chip = document.createElement("span");
        chip.className = "lw-skill-chip";
        chip.textContent = tool;
        cloud.appendChild(chip);
    });
}

// ── Contact ──────────────────────────────────────────────────────
export function populateContact() {
    const emailCta = document.getElementById("email-cta");
    if (emailCta) emailCta.href = `mailto:${resumeData.email}`;

    const locationEl = document.getElementById("hud-location");
    if (locationEl) locationEl.textContent = `Loc: ${resumeData.location}`;
}
