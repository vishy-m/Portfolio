/**
 * Custom cursor (ring + dot) and magnetic button effects.
 */

import gsap from "gsap";
import { prefersReducedMotion, finePointer } from "./config";

// ── Custom Cursor ────────────────────────────────────────────────
export function setupCustomCursor() {
    if (prefersReducedMotion || !finePointer) return;

    const shell = document.querySelector(".lw-cursor-shell");
    const ring = shell?.querySelector(".lw-cursor-ring");
    const dot = shell?.querySelector(".lw-cursor-dot");
    if (!shell || !ring || !dot) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const interactiveSelector =
        "a, button, .lw-project-card, .lw-marker-item, .lw-btn";

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

// ── Magnetic Buttons ─────────────────────────────────────────────
export function setupMagneticButtons() {
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
