import gsap from "gsap";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createPortalNode() {
  let node = document.getElementById("portal-transition");
  if (node) return node;

  node = document.createElement("div");
  node.id = "portal-transition";
  node.setAttribute("aria-hidden", "true");
  node.dataset.theme = "home";
  node.innerHTML = `
    <div class="portal-veil"></div>
    <div class="portal-core"></div>
    <p class="portal-label">Entering</p>
  `;
  document.body.appendChild(node);
  return node;
}

function shouldHandleLink(anchor) {
  const href = anchor.getAttribute("href");
  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.rel && anchor.rel.includes("external")) return false;
  return true;
}

function isInternalNavigation(anchor) {
  try {
    const url = new URL(anchor.href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function setupPortalNavigation() {
  const portal = createPortalNode();
  const label = portal.querySelector(".portal-label");
  const core = portal.querySelector(".portal-core");
  if (!label || !core) return;

  const pending = sessionStorage.getItem("portal-nav-pending");
  if (pending) {
    sessionStorage.removeItem("portal-nav-pending");
    if (prefersReducedMotion) {
      gsap.set(portal, { autoAlpha: 0 });
      portal.classList.remove("is-entering");
    } else {
      portal.classList.add("is-entering");
      gsap.set(portal, { autoAlpha: 1, "--portal-scale": 1.2 });
      gsap.set(label, { autoAlpha: 1 });
      gsap.to(portal, {
        autoAlpha: 0,
        duration: 0.95,
        ease: "power2.out",
        onComplete: () => portal.classList.remove("is-entering")
      });
      gsap.to(portal, { "--portal-scale": 0, duration: 0.85, ease: "power3.out" });
      gsap.to(label, { autoAlpha: 0, duration: 0.6, ease: "power2.out" });
    }
  }

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor) return;
    if (!shouldHandleLink(anchor) || !isInternalNavigation(anchor)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const url = new URL(anchor.href, window.location.href);
    if (url.href === window.location.href) return;

    event.preventDefault();
    if (prefersReducedMotion) {
      window.location.href = url.href;
      return;
    }

    portal.classList.add("is-active");
    portal.dataset.theme = anchor.dataset.portalTheme || "home";
    label.textContent = anchor.dataset.portalLabel || "Entering";

    gsap.killTweensOf([portal, core, label]);
    gsap.set(portal, { autoAlpha: 1, "--portal-scale": 0 });
    gsap.set(label, { autoAlpha: 0, y: 10 });

    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        sessionStorage.setItem("portal-nav-pending", "1");
        window.location.href = url.href;
      }
    });
    timeline.to(portal, { "--portal-scale": 1.18, duration: 0.72 }, 0);
    timeline.to(core, { rotate: 34, duration: 0.72 }, 0);
    timeline.to(label, { autoAlpha: 1, y: 0, duration: 0.34, ease: "power2.out" }, 0.08);
  });
}
