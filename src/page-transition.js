/**
 * Page Transition — curtain-style cross-fade between pages.
 *
 * 1. On link click: fade in a dark overlay covering the page
 * 2. Once overlay is fully opaque: navigate
 * 3. On the destination page: overlay is already covering everything,
 *    populate content behind it, then fade overlay out
 *
 * This eliminates any flash of unstyled HTML during navigation.
 */

const FADE_IN_MS = 350;   // overlay fade-in (on source page)
const FADE_OUT_MS = 400;  // overlay fade-out (on destination page)
const BG_COLOR = "#0a0a0a"; // matches page background

let transitioning = false;

/** Create the overlay element (or return existing one). */
function getOverlay() {
    let overlay = document.getElementById("page-transition-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "page-transition-overlay";
        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            zIndex: "99999",
            background: BG_COLOR,
            opacity: "0",
            pointerEvents: "none",
            transition: `opacity ${FADE_IN_MS}ms ease`,
        });
        document.body.appendChild(overlay);
    }
    return overlay;
}

/** Fade in the overlay, then navigate to href. */
export function navigateWithTransition(href) {
    if (transitioning) return;
    transitioning = true;

    const overlay = getOverlay();
    overlay.style.pointerEvents = "all"; // block clicks during transition
    overlay.style.transition = `opacity ${FADE_IN_MS}ms ease`;

    // Force reflow so the transition actually fires
    void overlay.offsetHeight;
    overlay.style.opacity = "1";

    setTimeout(() => {
        // Signal the destination page that it should play the reveal
        sessionStorage.setItem("page-transition", "1");
        window.location.href = href;
    }, FADE_IN_MS);
}

/** On page load: if we arrived via transition, reveal from behind overlay. */
export function revealAfterTransition() {
    const pending = sessionStorage.getItem("page-transition");
    if (pending) {
        sessionStorage.removeItem("page-transition");

        // Create overlay already at full opacity (covering the raw HTML)
        const overlay = getOverlay();
        overlay.style.transition = "none";
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "all";

        // Wait a tick so content is painted behind the overlay, then fade out
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.style.transition = `opacity ${FADE_OUT_MS}ms ease`;
                overlay.style.opacity = "0";
                overlay.addEventListener("transitionend", () => {
                    overlay.style.pointerEvents = "none";
                }, { once: true });
            });
        });
    }
}

export function setupPageTransitions() {
    // Intercept clicks on links that navigate to internal pages
    document.addEventListener("click", (e) => {
        const anchor = e.target.closest("a[href]");
        if (!anchor) return;

        const href = anchor.getAttribute("href");
        if (!href) return;

        // Skip external links, hash-only links, and new-tab links
        if (href.startsWith("http") || href.startsWith("mailto:") || href === "#") return;
        if (anchor.target === "_blank") return;

        // Skip hash links on the same page (scroll anchors)
        if (href.startsWith("#")) return;

        // Only intercept links that navigate to a different page
        const url = new URL(href, window.location.origin);
        if (url.pathname === window.location.pathname) return;

        e.preventDefault();
        navigateWithTransition(href);
    });
}
