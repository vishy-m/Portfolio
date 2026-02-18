/**
 * Lightweight page transition — fade + slide.
 *
 * Exit:  current page fades out and slides up slightly before navigating.
 * Enter: new page fades in and slides up from a slight offset.
 *
 * Attach to any internal links with `[data-transition]` or call
 * `setupPageTransitions()` to auto-attach to project links.
 */

const DURATION = 380; // ms

/* ── CSS injected once ────────────────────────────────────────────── */
function injectStyles() {
    if (document.getElementById("page-transition-styles")) return;
    const style = document.createElement("style");
    style.id = "page-transition-styles";
    style.textContent = `
    .page-transition-enter {
      animation: pt-enter ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .page-transition-exit {
      animation: pt-exit ${DURATION}ms cubic-bezier(0.55, 0, 1, 0.45) both;
      pointer-events: none;
    }
    @keyframes pt-enter {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pt-exit {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(-12px); }
    }
  `;
    document.head.appendChild(style);
}

/* ── Exit transition ──────────────────────────────────────────────── */
function transitionOut(href) {
    return new Promise((resolve) => {
        document.body.classList.add("page-transition-exit");
        setTimeout(() => {
            window.location.href = href;
            resolve();
        }, DURATION - 40); // navigate slightly before animation ends for snappier feel
    });
}

/* ── Enter transition ─────────────────────────────────────────────── */
function transitionIn() {
    document.body.classList.add("page-transition-enter");
    document.body.addEventListener(
        "animationend",
        () => document.body.classList.remove("page-transition-enter"),
        { once: true }
    );
}

/* ── Setup — call from any page ───────────────────────────────────── */
export function setupPageTransitions() {
    injectStyles();

    // Enter animation on page load
    transitionIn();

    // Intercept internal links: project cards, nav links, back links
    document.addEventListener("click", (e) => {
        const anchor = e.target.closest(
            'a[href*="project-"], a[href*="index.html"], .project-back, .project-jump, .project-nav a, .lw-card-link'
        );
        if (!anchor) return;

        const href = anchor.getAttribute("href");
        // Only transition for local navigation
        if (!href || href.startsWith("http") || href.startsWith("//") || href.startsWith("mailto")) return;

        e.preventDefault();
        transitionOut(href);
    });
}
