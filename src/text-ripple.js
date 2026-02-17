/**
 * Water-wave text ripple + ambient glow system.
 *
 * Cursor movement sends adaptive, smooth character waves outward
 * through text.  Wave size scales with font size so the visual
 * splash feels consistent everywhere.
 *
 * Characters support unlimited overlapping waves via a version-ID
 * system: each new wave bumps `scrambleId` inside its delay callback
 * so the previous animation keeps running until the new one is ready.
 */

import { prefersReducedMotion, finePointer } from "./config";

// ── Scramble Glyphs ──────────────────────────────────────────────
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@!?+=";

// ── Tuning Constants ─────────────────────────────────────────────
const WAVE_MIN_CHARS = 12;        // chars affected for largest text (~100px+)
const WAVE_MAX_CHARS = 50;        // chars affected for smallest text (~14px)
const WAVE_REFERENCE_SIZE = 16;   // font-size that maps to WAVE_MAX_CHARS
const WAVE_LARGE_SIZE = 80;       // font-size that maps to WAVE_MIN_CHARS

const SCRAMBLE_DURATION = 160;    // ms — how long a char stays scrambled
const DELAY_PER_RANK = 12;        // ms stagger between successive chars
const MOVE_THRESHOLD = 70;        // px cursor must travel to fire a wave
const GLOW_LINGER = 1200;         // ms — gray afterglow fade duration

// ── Colour Palette ───────────────────────────────────────────────
const COLOR_SCRAMBLE = "rgba(120, 180, 255, 1)";
const SHADOW_SCRAMBLE = "0 0 12px rgba(80, 150, 255, 0.9), 0 0 25px rgba(60, 120, 255, 0.4)";
const COLOR_AFTERGLOW = "rgba(210, 215, 225, 1)";
const SHADOW_AFTERGLOW = "0 0 8px rgba(180, 190, 210, 0.5), 0 0 18px rgba(160, 170, 195, 0.2)";
const TRANSITION_FAST = "color 150ms ease, text-shadow 200ms ease";

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Compute the adaptive wave character count from a font size.
 * Large text → fewer chars (concentrated splash);
 * small text → more chars (wide ripple).
 */
function getWaveCount(fontSize) {
    const t = Math.min(1, Math.max(0,
        (fontSize - WAVE_REFERENCE_SIZE) / (WAVE_LARGE_SIZE - WAVE_REFERENCE_SIZE)
    ));
    return Math.round(WAVE_MAX_CHARS + t * (WAVE_MIN_CHARS - WAVE_MAX_CHARS));
}

/**
 * Split a DOM element's text nodes into individual `<span>` characters,
 * each with a locked width to prevent layout shifts during scramble.
 */
function splitElement(el, chars) {
    if (el.dataset.glowSplit) return;
    if (el.children.length > 0 && el.textContent.trim() === "") return;
    if (el.querySelector(".lw-glow-char")) return;

    el.dataset.glowSplit = "true";

    const fontSize = parseFloat(window.getComputedStyle(el).fontSize) || 16;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((textNode) => {
        const text = textNode.textContent;
        if (!text.trim()) return;

        const frag = document.createDocumentFragment();
        const batch = [];

        // Split by whitespace, capturing the whitespace
        const parts = text.split(/(\s+)/);

        parts.forEach((part) => {
            if (!part) return;

            // 1. Whitespace → append as text node (allows wrapping between words)
            if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(part));
                return;
            }

            // 2. Word → wrap in nowrap span to prevent mid-word breaks
            const wordWrapper = document.createElement("span");
            wordWrapper.style.display = "inline-block";
            wordWrapper.style.whiteSpace = "nowrap";

            for (let i = 0; i < part.length; i++) {
                const ch = part[i];
                const span = document.createElement("span");
                span.className = "lw-glow-char";
                span.textContent = ch;
                span.style.transition = TRANSITION_FAST;
                span.style.display = "inline-block";
                wordWrapper.appendChild(span);

                const charObj = { el: span, original: ch, scrambleId: 0, fontSize };
                chars.push(charObj);
                batch.push(charObj);
            }
            frag.appendChild(wordWrapper);
        });

        textNode.parentNode.replaceChild(frag, textNode);

        // Lock widths after insertion so glyph swaps never shift layout
        for (const c of batch) {
            c.el.style.width = c.el.offsetWidth + "px";
            c.el.style.textAlign = "center";
        }
    });
}

/**
 * Return the `count` characters nearest to (x, y), sorted by distance.
 * Off-screen characters are skipped for performance.
 */
function getNearest(chars, x, y, count) {
    const scored = [];
    for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        const rect = c.el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        scored.push({ c, dist: Math.hypot(x - cx, y - cy) });
    }
    scored.sort((a, b) => a.dist - b.dist);
    return scored.slice(0, count);
}

// ── Core Scramble Animation ──────────────────────────────────────

/**
 * Scramble a single character.  The scrambleId bump is deferred inside
 * the delay callback so the previous animation keeps running until
 * the new one is truly ready — eliminating freeze gaps.
 */
function scrambleChar(c, delay) {
    setTimeout(() => {
        const myId = ++c.scrambleId;

        // Reset to instant transition for the scramble phase
        c.el.style.transition = "none";

        let flicks = 0;
        const maxFlicks = 2 + Math.floor(Math.random() * 2);
        const interval = SCRAMBLE_DURATION / maxFlicks;

        const flicker = () => {
            if (c.scrambleId !== myId) return;

            if (flicks < maxFlicks) {
                c.el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                c.el.style.color = COLOR_SCRAMBLE;
                c.el.style.textShadow = SHADOW_SCRAMBLE;
                flicks++;
                setTimeout(flicker, interval);
            } else {
                // Revert text → gray afterglow phase
                c.el.textContent = c.original;
                c.el.style.transition =
                    `color ${GLOW_LINGER}ms ease-out, text-shadow ${GLOW_LINGER}ms ease-out`;
                c.el.style.color = COLOR_AFTERGLOW;
                c.el.style.textShadow = SHADOW_AFTERGLOW;

                // Brief hold then fade back to default
                setTimeout(() => {
                    if (c.scrambleId !== myId) return;
                    c.el.style.color = "";
                    c.el.style.textShadow = "";
                    setTimeout(() => {
                        c.el.style.transition = TRANSITION_FAST;
                    }, GLOW_LINGER);
                }, 300);
            }
        };
        flicker();
    }, delay);
}

// ── Wave Trigger ─────────────────────────────────────────────────

function triggerWave(chars, x, y) {
    const probe = getNearest(chars, x, y, 1);
    if (!probe.length) return;

    const waveCount = getWaveCount(probe[0].c.fontSize);
    const nearest = getNearest(chars, x, y, waveCount);

    for (let rank = 0; rank < nearest.length; rank++) {
        scrambleChar(nearest[rank].c, rank * DELAY_PER_RANK);
    }
}

// ── Ambient Glow Loop ────────────────────────────────────────────

function startAmbientGlow(chars, getMouse) {
    const loop = () => {
        const { x, y } = getMouse();

        if (x < -999) {
            // Mouse off-screen — clear all glow
            for (let i = 0; i < chars.length; i++) {
                chars[i].el.style.textShadow = "";
            }
            requestAnimationFrame(loop);
            return;
        }

        const probe = getNearest(chars, x, y, 1);
        const fontSize = probe.length ? probe[0].c.fontSize : 16;
        const glowCount = Math.round(getWaveCount(fontSize) * 1.5);
        const glowChars = getNearest(chars, x, y, glowCount);
        const glowSet = new Set(glowChars.map((g) => g.c));

        for (let i = 0; i < chars.length; i++) {
            const c = chars[i];
            // Skip off-screen chars
            const rect = c.el.getBoundingClientRect();
            if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;

            if (glowSet.has(c)) {
                const rank = glowChars.findIndex((g) => g.c === c);
                const alpha = ((1 - rank / glowCount) * 0.3).toFixed(2);
                c.el.style.textShadow = `0 0 8px rgba(220, 230, 255, ${alpha})`;
            } else {
                c.el.style.textShadow = "";
            }
        }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

// ── Public Entry Point ───────────────────────────────────────────

export function setupTextRipple() {
    if (prefersReducedMotion || !finePointer) return;

    const textRoot = document.getElementById("main-content") || document.querySelector(".project-layout");
    if (!textRoot) return;

    // Split all visible text into individually addressable characters
    const chars = [];
    const selectors = "h1, h2, h3, p, span, a, li, strong, em, div";
    textRoot.querySelectorAll(selectors).forEach((el) => {
        if (
            el.children.length === 0 ||
            el.matches("a, li, strong, em, span, p, h1, h2, h3")
        ) {
            splitElement(el, chars);
        }
    });

    // Mouse state
    let mouseX = -9999;
    let mouseY = -9999;
    let lastWaveX = -9999;
    let lastWaveY = -9999;

    document.addEventListener("pointermove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        const dist = Math.hypot(mouseX - lastWaveX, mouseY - lastWaveY);
        if (dist > MOVE_THRESHOLD) {
            triggerWave(chars, mouseX, mouseY);
            lastWaveX = mouseX;
            lastWaveY = mouseY;
        }
    });

    document.addEventListener("mouseleave", () => {
        mouseX = mouseY = lastWaveX = lastWaveY = -9999;
    });

    // Ambient glow
    startAmbientGlow(chars, () => ({ x: mouseX, y: mouseY }));
}
