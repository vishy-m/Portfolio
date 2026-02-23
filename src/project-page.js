import "./project.css";
import "./lightweight.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { getProjectNeighbors, getProjectRealm } from "./data/project-realms";
import { setupTextRipple } from "./text-ripple";
import { setupPageTransitions, revealAfterTransition } from "./page-transition";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Scans text for bare URLs (http:// or https://...) and returns a DocumentFragment
 * where URLs are converted into proper target="_blank" anchor tags.
 */
function parseLinksToNodes(text) {
  const frag = document.createDocumentFragment();
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const a = el("a", "inline-url-link reveal", match[0]);
    a.href = match[0];
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    frag.appendChild(a);
    lastIndex = urlRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return frag;
}

function setProjectContent(project) {
  document.title = `${project.title} | Vishruth Meda`;
  document.body.dataset.theme = project.theme;
  document.documentElement.style.setProperty("--project-accent", project.accent);
  document.documentElement.style.setProperty("--project-secondary", project.secondary);

  document.getElementById("project-kicker").textContent = project.projectTag;
  document.getElementById("project-title").textContent = project.title;
  document.getElementById("project-subtitle").textContent = project.subtitle;
  document.getElementById("project-impact-note").textContent = project.impact || "";

  // ── Metrics ──────────────────────────────────────────────────
  const metrics = document.getElementById("project-metrics");
  if (project.metrics && project.metrics.length > 0) {
    project.metrics.forEach((item) => {
      const card = el("article", "metric-card reveal");
      card.append(el("p", "label", item.label), el("p", "value", item.value));
      metrics.appendChild(card);
    });
  }

  // ── Body sections interleaved with media ──────────────────────
  const bodyContainer = document.getElementById("project-body-container");
  if (bodyContainer) {
    const bodies = project.bodies || [];

    const createMediaElement = (filename, autoplay = false) => {
      const ext = filename.split(".").pop().toLowerCase();
      const isVideo = ["mp4", "webm", "mov"].includes(ext);
      const isCsv = ext === "csv";

      const wrapper = el("div", isVideo ? "media-item media-video reveal" : "media-item reveal");

      if (isVideo) {
        const video = document.createElement("video");
        video.src = `${import.meta.env.BASE_URL}assets/${project.id}/${filename}`;
        video.playsInline = true;

        if (autoplay) {
          video.autoplay = true;
          video.loop = true;
          video.muted = true;
        } else {
          video.controls = true;
          video.preload = "metadata";
        }

        wrapper.appendChild(video);
      } else if (isCsv) {
        wrapper.classList.add("media-csv");
        const container = el("div", "csv-embed-container");
        wrapper.appendChild(container);
        renderCsvInline(`${import.meta.env.BASE_URL}assets/${project.id}/${filename}`, filename, container);
      } else {
        const img = document.createElement("img");
        img.src = `${import.meta.env.BASE_URL}assets/${project.id}/${filename}`;
        img.alt = `${project.title} — ${filename}`;
        img.loading = "lazy";
        wrapper.appendChild(img);
      }
      return wrapper;
    };

    bodies.forEach((body) => {
      const layout = body.layout || "bottom";
      const section = el("section", `project-section project-body-section layout-${layout}`);
      const contentWrapper = el("div", "section-content-wrapper");

      const heading = el("h2", "reveal", body.title);
      const paragraph = el("p", "project-body-text reveal");
      paragraph.appendChild(parseLinksToNodes(body.content));

      contentWrapper.append(heading, paragraph);

      const mediaSection = el("div", "project-media-inline");
      let addedMedia = false;

      // Insert requested assets inline
      if (body.assets && body.assets.length > 0) {
        body.assets.forEach((f) => {
          mediaSection.appendChild(createMediaElement(f, body.autoplay));
          addedMedia = true;
        });
      }

      if (layout === "top" && addedMedia) {
        section.append(mediaSection, contentWrapper);
      } else if (layout === "left" && addedMedia) {
        section.classList.add("layout-horizontal");
        section.append(mediaSection, contentWrapper);
      } else if (layout === "right" && addedMedia) {
        section.classList.add("layout-horizontal");
        section.append(contentWrapper, mediaSection);
      } else {
        // Default: Bottom
        section.append(contentWrapper);
        if (addedMedia) section.appendChild(mediaSection);
      }

      bodyContainer.appendChild(section);
    });
  }

  // ── Stack / Tools ────────────────────────────────────────────
  const stack = document.getElementById("project-stack");
  if (project.stack && project.stack.length > 0) {
    project.stack.forEach((item) => stack.appendChild(el("span", "stack-pill reveal", item)));
  }

  // ── External links ───────────────────────────────────────────
  const linksContainer = document.getElementById("project-links-container");
  if (linksContainer && project.assets && project.assets.links && project.assets.links.length > 0) {
    const section = el("section", "project-section project-links-section");
    section.appendChild(el("h2", "reveal", "Links"));
    const linksList = el("div", "project-links-list");

    project.assets.links.forEach((linkStr) => {
      const a = document.createElement("a");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "project-ext-link reveal";

      const match = linkStr.match(/^(.*?):\s*(https?:\/\/[^\s]+)$/);
      if (match) {
        a.href = match[2];
        a.textContent = match[1].trim() + " →";
      } else {
        a.href = linkStr;
        try {
          a.textContent = new URL(linkStr).hostname.replace("www.", "") + " →";
        } catch {
          a.textContent = linkStr;
        }
      }
      linksList.appendChild(a);
    });

    section.appendChild(linksList);
    linksContainer.appendChild(section);
  }

  // ── Navigation ───────────────────────────────────────────────
  const { previous, next } = getProjectNeighbors(project.id);
  const prevLink = document.getElementById("project-prev");
  const nextLink = document.getElementById("project-next");
  const jumpLink = document.getElementById("project-jump");
  const homeLink = document.querySelector(".project-back");

  prevLink.href = `${import.meta.env.BASE_URL}${previous.path}`;
  prevLink.querySelector("strong").textContent = previous.title;

  nextLink.href = `${import.meta.env.BASE_URL}${next.path}`;
  nextLink.querySelector("strong").textContent = next.title;

  jumpLink.href = `${import.meta.env.BASE_URL}index.html#projects`;

  homeLink.href = `${import.meta.env.BASE_URL}index.html#projects`;
}

// ── Inline CSV Renderer ───────────────────────────────────────
async function renderCsvInline(url, filename, container) {
  container.innerHTML = `<div class="csv-loading">Loading data...</div>`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("File not found");
    const text = await response.text();
    const allRows = text.split("\n")
      .map(r => r.split(",").map(c => c.trim()))
      .filter(r => r.length > 1 || (r.length === 1 && r[0] !== ""));

    if (allRows.length === 0) {
      container.innerHTML = `<div class="csv-error">No data in ${filename}</div>`;
      return;
    }

    const MAX_ROWS = 35;
    const isTruncated = allRows.length > MAX_ROWS + 1; // +1 for header
    const rows = allRows.slice(0, MAX_ROWS + 1);

    const tableWrapper = el("div", "csv-table-scroll");
    tableWrapper.setAttribute("data-lenis-prevent", "");
    const table = document.createElement("table");
    table.className = "csv-table";

    // Header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    rows[0].forEach(cell => {
      const th = document.createElement("th");
      th.textContent = cell;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement("tbody");
    rows.slice(1).forEach(rowData => {
      const tr = document.createElement("tr");
      rowData.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    container.innerHTML = "";
    if (filename) {
      const meta = el("div", "csv-metadata");
      meta.innerHTML = `<span class="csv-label">Data Source: ${filename}</span>`;
      if (isTruncated) {
        meta.innerHTML += ` <span class="csv-truncated-note">(Showing first ${MAX_ROWS} rows)</span>`;
      }
      container.appendChild(meta);
    }
    container.appendChild(tableWrapper);
  } catch (err) {
    container.innerHTML = `<div class="csv-error">Failed to load CSV: ${err.message}</div>`;
  }
}

function initSmoothScroll() {
  if (prefersReducedMotion) return null;
  const lenis = new Lenis({ duration: 1.08, smoothWheel: true, wheelMultiplier: 0.92 });
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  lenis.on("scroll", ScrollTrigger.update);
  return lenis;
}

function setupPageAnimations(project) {
  const revealItems = gsap.utils.toArray(".reveal");
  revealItems.forEach((item) => {
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: prefersReducedMotion ? 0 : 0.86,
      ease: "power3.out",
      scrollTrigger: prefersReducedMotion
        ? undefined
        : {
          trigger: item,
          start: "top 86%",
          once: true
        }
    });
  });

  if (prefersReducedMotion) return;

  const sections = gsap.utils.toArray(".project-section");
  const chapterItems = gsap.utils.toArray("#project-chapters li");
  const metricCards = gsap.utils.toArray(".metric-card");
  const stackPills = gsap.utils.toArray(".stack-pill");

  gsap.fromTo(
    ".project-title",
    { y: 28, opacity: 0, filter: "blur(10px)" },
    { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.92, ease: "power3.out" }
  );

  if (project.theme === "ledger") {
    gsap.fromTo(
      metricCards,
      { y: 28, scale: 0.95, rotateY: -8 },
      {
        y: 0,
        scale: 1,
        rotateY: 0,
        stagger: 0.08,
        duration: 0.78,
        ease: "power3.out",
        scrollTrigger: { trigger: "#project-metrics", start: "top 82%" }
      }
    );
  } else if (project.theme === "forge") {
    chapterItems.forEach((item, index) => {
      gsap.fromTo(
        item,
        { x: index % 2 === 0 ? -66 : 66, opacity: 0.2 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 86%" }
        }
      );
    });
  } else if (project.theme === "citadel") {
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { scale: 0.96, opacity: 0.78 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            end: "top 48%",
            scrub: true
          }
        }
      );
    });
  }

  // Floating stack pills — applied to ALL projects
  stackPills.forEach((pill, index) => {
    gsap.to(pill, {
      y: () => Math.sin(index * 0.6) * 9,
      repeat: -1,
      yoyo: true,
      duration: 1.3 + (index % 3) * 0.2,
      ease: "sine.inOut"
    });
  });
}

function createThemePrimitive(THREE, theme) {
  const group = new THREE.Group();
  const up = new THREE.Vector3(0, 1, 0);
  const addLink = (from, to, radius = 0.02) => {
    const direction = to.clone().sub(from);
    const length = direction.length();
    if (length < 0.001) return;
    const center = from.clone().add(to).multiplyScalar(0.5);
    const link = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length, 10),
      new THREE.MeshStandardMaterial()
    );
    link.position.copy(center);
    link.quaternion.setFromUnitVectors(up, direction.normalize());
    group.add(link);
  };

  if (theme === "ledger") {
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 1.08), new THREE.MeshStandardMaterial());
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.24, 0.72), new THREE.MeshStandardMaterial());
    chip.position.y = 0.18;
    group.add(board, chip);

    const pinGeoA = new THREE.BoxGeometry(0.06, 0.03, 0.16);
    for (let i = 0; i < 8; i += 1) {
      const x = -0.46 + i * 0.13;
      const north = new THREE.Mesh(pinGeoA, new THREE.MeshStandardMaterial());
      north.position.set(x, 0.04, 0.42);
      const south = north.clone();
      south.position.z = -0.42;
      group.add(north, south);
    }

    const bars = [0.22, 0.34, 0.5, 0.38];
    bars.forEach((height, index) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.11, height, 0.11), new THREE.MeshStandardMaterial());
      bar.position.set(-0.52 + index * 0.19, -0.03 + height * 0.5, -0.28);
      group.add(bar);
    });

    addLink(new THREE.Vector3(-0.42, 0.08, -0.04), new THREE.Vector3(0, 0.2, 0));
    addLink(new THREE.Vector3(0.42, 0.08, 0.04), new THREE.Vector3(0, 0.2, 0));
    return group;
  }

  if (theme === "forge") {
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.56, 2), new THREE.MeshStandardMaterial());
    const shield = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 12, 80), new THREE.MeshStandardMaterial());
    shield.rotation.set(Math.PI * 0.42, Math.PI * 0.18, 0);
    group.add(core, shield);

    const nodeGeo = new THREE.SphereGeometry(0.1, 14, 14);
    for (let i = 0; i < 12; i += 1) {
      const angle = (Math.PI * 2 * i) / 12;
      const nodePos = new THREE.Vector3(
        Math.cos(angle) * 1.12,
        Math.sin(angle * 1.7) * 0.4,
        Math.sin(angle) * 0.94
      );
      const node = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial());
      node.position.copy(nodePos);
      group.add(node);
      addLink(new THREE.Vector3(0, 0, 0), nodePos, 0.017);
    }
    return group;
  }

  if (theme === "signal") {
    const points = [
      new THREE.Vector3(-0.34, -0.28, 0),
      new THREE.Vector3(-0.2, 0.06, 0),
      new THREE.Vector3(-0.03, 0.25, 0.02),
      new THREE.Vector3(0.14, 0.35, 0.04),
      new THREE.Vector3(0.32, 0.45, 0.08),
      new THREE.Vector3(0.04, -0.2, -0.08),
      new THREE.Vector3(0.2, -0.02, -0.1),
      new THREE.Vector3(0.38, 0.12, -0.12),
      new THREE.Vector3(0.54, 0.27, -0.14)
    ];
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [2, 6]
    ];

    const nodeGeo = new THREE.SphereGeometry(0.085, 12, 12);
    points.forEach((point) => {
      const node = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial());
      node.position.copy(point);
      group.add(node);
    });
    edges.forEach(([from, to]) => addLink(points[from], points[to], 0.015));

    const wave = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.045, 10, 86), new THREE.MeshStandardMaterial());
    wave.rotation.set(Math.PI * 0.42, 0, Math.PI * 0.2);
    group.add(wave);
    return group;
  }

  const cell = new THREE.BoxGeometry(0.32, 0.32, 0.32);
  for (let x = -1; x <= 1; x += 1) {
    for (let z = -1; z <= 1; z += 1) {
      const height = (x === 0 && z === 0) ? 1.08 : 0.48 + (Math.abs(x) + Math.abs(z)) * 0.14;
      const tower = new THREE.Mesh(cell, new THREE.MeshStandardMaterial());
      tower.scale.y = height;
      tower.position.set(x * 0.42, -0.32 + height * 0.16, z * 0.42);
      group.add(tower);
    }
  }
  const shield = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.07, 12, 84), new THREE.MeshStandardMaterial());
  shield.rotation.x = Math.PI * 0.5;
  shield.position.y = 0.18;
  group.add(shield);
  return group;
}

function createThemeHalo(THREE, theme, accentColor) {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending
  });

  const makeRing = (radius, y, segments = 128) => {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * radius, y, Math.sin(t) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, mat);
  };

  if (theme === "ledger") {
    group.add(makeRing(1.42, -0.2), makeRing(1.08, 0.18), makeRing(0.72, 0.42));
  } else if (theme === "forge") {
    const ringA = makeRing(1.32, -0.1);
    ringA.rotation.x = Math.PI * 0.4;
    const ringB = makeRing(1.12, 0.24);
    ringB.rotation.z = Math.PI * 0.48;
    const ringC = makeRing(0.84, -0.18);
    ringC.rotation.y = Math.PI * 0.24;
    group.add(ringA, ringB, ringC);
  } else if (theme === "signal") {
    const wavePoints = [];
    for (let i = 0; i <= 160; i += 1) {
      const t = (i / 160) * Math.PI * 2;
      wavePoints.push(new THREE.Vector3(Math.cos(t) * 1.4, Math.sin(t * 2) * 0.16, Math.sin(t) * 1.2));
    }
    const wave = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wavePoints), mat);
    wave.rotation.y = Math.PI * 0.25;
    group.add(makeRing(1.5, 0.02, 100), makeRing(0.96, -0.16, 100), wave);
  } else {
    const ringA = makeRing(1.34, -0.2);
    ringA.rotation.y = Math.PI * 0.2;
    const ringB = makeRing(1.04, 0.3);
    ringB.rotation.x = Math.PI * 0.5;
    const ringC = makeRing(0.76, 0.06);
    ringC.rotation.z = Math.PI * 0.35;
    group.add(ringA, ringB, ringC);
  }

  return group;
}

async function initProjectScene(project) {
  const canvas = document.getElementById("project-canvas");
  if (!canvas || prefersReducedMotion) return;

  const THREE = await import("three");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5.7);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const accentColor = Number.parseInt(project.accent.replace("#", ""), 16);
  const secondaryColor = Number.parseInt(project.secondary.replace("#", ""), 16);

  scene.add(new THREE.AmbientLight(0xf6efe2, 0.78));

  const key = new THREE.DirectionalLight(0xf6efe2, 1.34);
  key.position.set(2.1, 2.4, 3.5);
  scene.add(key);

  const accent = new THREE.PointLight(accentColor, 1.94, 14, 1.4);
  accent.position.set(-2.2, -1.4, 2.2);
  scene.add(accent);

  const fill = new THREE.PointLight(secondaryColor, 1.12, 12, 1.6);
  fill.position.set(2.4, 0.5, -1.4);
  scene.add(fill);

  const particlesGeo = new THREE.BufferGeometry();
  const particles = new Float32Array(1200 * 3);
  for (let i = 0; i < particles.length; i += 3) {
    particles[i] = (Math.random() - 0.5) * 15;
    particles[i + 1] = (Math.random() - 0.5) * 9;
    particles[i + 2] = (Math.random() - 0.5) * 10;
  }
  particlesGeo.setAttribute("position", new THREE.BufferAttribute(particles, 3));
  const dust = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      color: 0xf6efe2,
      size: 0.016,
      opacity: 0.34,
      transparent: true,
      depthWrite: false
    })
  );
  scene.add(dust);

  let source = null;
  let externalModelLoaded = false;
  if (project.modelPath) {
    const loaderModule = await import("three/examples/jsm/loaders/GLTFLoader.js").catch(() => null);
    const GLTFLoader = loaderModule?.GLTFLoader;
    if (GLTFLoader) {
      const loader = new GLTFLoader();
      source = await loader
        .loadAsync(project.modelPath)
        .then((gltf) => gltf.scene)
        .catch(() => null);
      externalModelLoaded = Boolean(source);
    }
  }
  if (!source) {
    source = createThemePrimitive(THREE, project.theme);
  }

  source.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(source);
  const size = new THREE.Vector3();
  bounds.getSize(size);
  const normalize = (2.35 / Math.max(size.x, size.y, size.z || 1)) * (project.modelScale ?? 1);
  source.scale.setScalar(normalize);
  source.updateMatrixWorld(true);

  const centeredBounds = new THREE.Box3().setFromObject(source);
  const center = centeredBounds.getCenter(new THREE.Vector3());
  source.position.sub(center);
  source.rotation.y = Math.PI;

  const solidMaterials = [];
  const trackMaterial = (material) => {
    if (!material) return;
    if (Array.isArray(material)) {
      material.forEach((entry) => {
        if (entry) solidMaterials.push(entry);
      });
      return;
    }
    solidMaterials.push(material);
  };
  source.traverse((node) => {
    if (!node.isMesh) return;
    let mat;
    if (externalModelLoaded && node.material) {
      mat = Array.isArray(node.material)
        ? node.material.map((entry) => (entry?.clone ? entry.clone() : entry))
        : node.material.clone();
      const mats = Array.isArray(mat) ? mat : [mat];
      for (const entry of mats) {
        if (!entry) continue;
        entry.transparent = true;
        entry.opacity = 1;
        if ("roughness" in entry) {
          entry.roughness = clamp(entry.roughness ?? 0.45, 0.08, 0.94);
        }
        if ("metalness" in entry) {
          entry.metalness = clamp((entry.metalness ?? 0.34) * 1.03, 0, 1);
        }
        if ("emissive" in entry) {
          entry.emissive = new THREE.Color(secondaryColor);
          entry.emissiveIntensity = Math.max(entry.emissiveIntensity || 0, 0.1);
        }
      }
    } else {
      mat = new THREE.MeshPhysicalMaterial({
        color: 0xf6efe2,
        roughness: 0.24,
        metalness: 0.44,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        emissive: secondaryColor,
        emissiveIntensity: 0.24,
        transparent: true,
        opacity: 1
      });
    }
    node.material = mat;
    trackMaterial(mat);
  });

  const rig = new THREE.Group();
  rig.add(source);
  scene.add(rig);

  const halo = createThemeHalo(THREE, project.theme, accentColor);
  rig.add(halo);

  const state = { x: 0, y: 0.5, z: 0, scale: 1, form: 0.18, rotY: 0.8, rotX: 0.12, rotZ: 0 };
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
      state.form = 0.16 + self.progress * 0.66;
      state.y = 0.74 - self.progress * 1.22;
      state.x = Math.sin(self.progress * Math.PI * 2) * 0.42;
      state.scale = 1 + Math.sin(self.progress * Math.PI) * 0.22;
    }
  });

  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  window.addEventListener("pointermove", (event) => {
    pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
  });

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  const animate = () => {
    const t = clock.getElapsedTime();
    pointer.x = THREE.MathUtils.lerp(pointer.x, pointerTarget.x, 0.04);
    pointer.y = THREE.MathUtils.lerp(pointer.y, pointerTarget.y, 0.04);

    const formMix = clamp(state.form, 0, 1);
    rig.position.set(state.x + pointer.x * 0.32, state.y - pointer.y * 0.2, state.z);
    rig.rotation.set(state.rotX + pointer.y * 0.11, state.rotY + t * 0.22, state.rotZ + pointer.x * 0.08);
    rig.scale.setScalar(state.scale);

    halo.rotation.y = t * (project.theme === "signal" ? 0.8 : 0.35);
    halo.rotation.x = Math.sin(t * 0.5) * 0.12;

    if (project.theme === "forge") {
      source.rotation.z = Math.sin(t * 0.9) * 0.08;
    } else if (project.theme === "signal") {
      source.rotation.x = Math.sin(t * 1.3) * 0.1;
      source.rotation.z = Math.cos(t * 1.1) * 0.08;
    } else if (project.theme === "citadel") {
      source.rotation.y += 0.004;
    }

    for (const mat of solidMaterials) {
      mat.opacity = 0.94 - formMix * 0.24;
      if ("roughness" in mat) {
        mat.roughness = THREE.MathUtils.lerp(0.2, 0.82, formMix);
      }
      if ("metalness" in mat) {
        mat.metalness = THREE.MathUtils.lerp(0.48, 0.1, formMix);
      }
      if ("emissiveIntensity" in mat) {
        mat.emissiveIntensity = THREE.MathUtils.lerp(0.18, 0.42, formMix);
      }
    }

    dust.rotation.y = t * 0.01;
    dust.rotation.x = t * 0.005;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.3, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -pointer.y * 0.18 + formMix * 0.18, 0.03);
    camera.lookAt(rig.position.x * 0.14, rig.position.y * 0.1, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
}

async function boot() {
  const projectId = document.body.dataset.projectId || "finance-wizard";
  const project = getProjectRealm(projectId);


  setProjectContent(project);
  initSmoothScroll();
  setupPageAnimations(project);
  setupTextRipple();
  setupPageTransitions();
  ScrollTrigger.refresh();

  // Reveal page now that content is populated (prevents FOUC)
  document.body.style.opacity = "1";
  revealAfterTransition();
}

boot();
