/**
 * Scroll-based animation systems.
 *
 * - Lenis smooth scrolling
 * - GSAP reveal / parallax animations
 * - Section scroll markers
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion } from "./config";

gsap.registerPlugin(ScrollTrigger);

// ── Smooth Scrolling (Lenis) ─────────────────────────────────────
export function initSmoothScroll() {
    if (prefersReducedMotion) return null;

    const lenis = new Lenis({
        smoothWheel: true,
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
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

// ── GSAP Reveal Animations ───────────────────────────────────────
export function setupRevealAnimations() {
    // Hero — staggered intro
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
            delay: 0.3,
        }
    );

    // Scroll-triggered reveals (skip hero)
    gsap.utils.toArray(".lw-reveal").forEach((el) => {
        if (el.closest("#hero")) return;
        gsap.fromTo(
            el,
            { y: 60, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }
        );
    });

    // Project cards
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
                    once: true,
                },
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
                        scrub: 1,
                    },
                }
            );
        });
    }
}

// ── Scroll Markers ───────────────────────────────────────────────
export function setupScrollMarkers() {
    const markers = document.querySelectorAll(".lw-marker-item");

    markers.forEach((marker) => {
        const targetId = marker.dataset.target;
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        ScrollTrigger.create({
            trigger: targetSection,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
                if (self.isActive) {
                    markers.forEach((m) => m.classList.remove("active"));
                    marker.classList.add("active");
                }
            },
        });

        marker.addEventListener("click", () => {
            targetSection.scrollIntoView({ behavior: "smooth" });
        });
    });
}

// Re-export ScrollTrigger so main.js can call refresh()
export { ScrollTrigger };
