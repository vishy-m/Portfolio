#!/usr/bin/env node
/**
 * build-projects.js
 *
 * Scans projects/*.txt, parses each into structured data,
 * collects assets from assets/<id>/, and generates:
 *   1. src/data/project-realms.js  (project data module)
 *   2. project-<id>.html            (one entry-point per project)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { resolve, basename, extname, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PROJECTS_DIR = join(ROOT, "projects");
const ASSETS_DIR = join(ROOT, "assets");
const PUBLIC_ASSETS = join(ROOT, "public", "assets");
const TEMPLATE = join(ROOT, "project.html");
const OUTPUT_DATA = join(ROOT, "src", "data", "project-realms.js");
const ABOUT_DIR = join(ROOT, "about");
const OUTPUT_ABOUT = join(ROOT, "src", "data", "about-data.js");

// ── Default theme palette (cycles for each project) ──────────────
const PALETTES = [
    { theme: "ledger", accent: "#c9a24b", secondary: "#35463f" },
    { theme: "forge", accent: "#8f6a33", secondary: "#35463f" },
    { theme: "signal", accent: "#c9a24b", secondary: "#8f6a33" },
    { theme: "citadel", accent: "#8f6a33", secondary: "#35463f" },
];

// ── Parse a single .txt file ─────────────────────────────────────
function parseTxtFile(filePath) {
    const raw = readFileSync(filePath, "utf-8");
    const lines = raw.split("\n");

    const project = {
        title: "",
        subtitle: "",
        impact: "",
        metrics: [],
        bodies: [],
        stack: [],
        modelPath: "",
        links: [],
        thumbnail: "",
    };

    let i = 0;
    const peek = () => (i < lines.length ? lines[i] : null);
    const consume = () => lines[i++];

    while (i < lines.length) {
        const line = peek();

        // ── Title ────────────────────────────────────────────────
        if (/^Title:\s*$/i.test(line)) {
            consume();
            project.title = (consume() || "").trim();
            continue;
        }

        // ── Description ──────────────────────────────────────────
        if (/^Description:\s*$/i.test(line)) {
            consume();
            const descLines = [];
            while (peek() !== null && peek().trim() !== "" && !/^(Project Metrics|Body \d|Tools used|Models|Links):/i.test(peek())) {
                descLines.push(consume().trim());
            }
            project.subtitle = descLines.join(" ");
            continue;
        }

        // ── Project Metrics ──────────────────────────────────────
        if (/^Project Metrics:\s*$/i.test(line)) {
            consume();
            // Skip blank lines after the header
            while (peek() !== null && peek().trim() === "") consume();
            while (peek() !== null && /^\s*-\s+/.test(peek())) {
                const labelLine = consume();
                const labelMatch = labelLine.match(/^\s*-\s+(.+?):\s*$/);
                if (labelMatch) {
                    const label = labelMatch[1].trim();
                    const value = (consume() || "").trim();
                    project.metrics.push({ label, value });
                }
            }
            continue;
        }

        // ── Body N: <Title: X> ───────────────────────────────────
        const bodyMatch = line?.match(/^Body \d+:\s*<Title:\s*([^>]+)>(?:\s*<Asset:\s*([^>]+)>)?\s*$/i);
        if (bodyMatch) {
            consume();
            const title = bodyMatch[1].trim();
            const assetRaw = bodyMatch[2] ? bodyMatch[2].trim() : "";
            const assets = assetRaw ? assetRaw.split(",").map((a) => a.trim()).filter(Boolean) : [];
            const bodyLines = [];
            while (peek() !== null && peek().trim() !== "" && !/^(Body \d|Tools used|Models|Links):/i.test(peek())) {
                bodyLines.push(consume().trim());
            }
            project.bodies.push({ title, content: bodyLines.join(" "), assets });
            continue;
        }

        // ── Tools used ───────────────────────────────────────────
        if (/^Tools used:\s*$/i.test(line)) {
            consume();
            const toolLine = (consume() || "").trim();
            if (toolLine) {
                project.stack = toolLine.split(",").map((t) => t.trim()).filter(Boolean);
            }
            continue;
        }

        // ── Models ───────────────────────────────────────────────
        if (/^Models:\s*$/i.test(line)) {
            consume();
            const modelLine = (peek() || "").trim();
            if (modelLine && !/^(Title|Description|Project Metrics|Body \d|Tools used|Links|Thumbnail):/i.test(modelLine)) {
                project.modelPath = consume().trim();
            }
            continue;
        }

        // ── Thumbnail ────────────────────────────────────────────
        const thumbMatch = line?.match(/^Thumbnail:\s*(.*)$/i);
        if (thumbMatch) {
            consume();
            let val = thumbMatch[1].trim();
            if (!val) {
                val = (peek() || "").trim();
                if (val && !/^(Title|Description|Project Metrics|Body \d|Tools used|Links|Models):/i.test(val)) {
                    val = consume().trim();
                } else {
                    val = "";
                }
            }
            project.thumbnail = val;
            continue;
        }

        // Skip blank or unrecognized lines
        consume();
    }

    return project;
}

// ── Parse profile.txt ────────────────────────────────────────────
function parseProfileFile(filePath) {
    const raw = readFileSync(filePath, "utf-8");
    const lines = raw.split("\n");
    const data = { bio: "", skills: [], profileImage: "" };

    let currentField = "";
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (/^Bio:$/i.test(trimmed)) {
            currentField = "bio";
            continue;
        }
        if (/^Skills:$/i.test(trimmed)) {
            currentField = "skills";
            continue;
        }
        if (/^ProfileImage:$/i.test(trimmed)) {
            currentField = "profileImage";
            continue;
        }

        if (currentField === "bio") {
            data.bio += (data.bio ? " " : "") + trimmed;
        } else if (currentField === "skills") {
            const split = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
            data.skills.push(...split);
        } else if (currentField === "profileImage") {
            data.profileImage = trimmed;
        }
    }
    return data;
}

// ── Collect assets from assets/<id>/ ─────────────────────────────
function collectAssets(projectId) {
    const assetsPath = join(ASSETS_DIR, projectId);
    const result = { images: [], videos: [], documents: [], links: [] };

    if (!existsSync(assetsPath)) return result;

    const files = readdirSync(assetsPath);
    for (const file of files) {
        const ext = extname(file).toLowerCase();
        if (file === "links.txt") {
            const raw = readFileSync(join(assetsPath, file), "utf-8");
            result.links = raw.split("\n").map((l) => l.trim()).filter(Boolean);
        } else if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
            result.images.push(file);
        } else if ([".mp4", ".webm", ".mov"].includes(ext)) {
            result.videos.push(file);
        } else if ([".csv"].includes(ext)) {
            result.documents.push(file);
        }
    }

    // Sort for deterministic output
    result.images.sort();
    result.videos.sort();
    result.documents.sort();

    return result;
}

// ── Copy assets to public/assets/<id>/ ───────────────────────────
function copyAssetsToPublic(projectId) {
    const src = join(ASSETS_DIR, projectId);
    const dest = join(PUBLIC_ASSETS, projectId);

    if (!existsSync(src)) return;
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });

    const files = readdirSync(src);
    for (const file of files) {
        if (file === "links.txt") continue; // Don't copy links.txt to public
        const srcFile = join(src, file);
        const destFile = join(dest, file);
        if (statSync(srcFile).isFile()) {
            copyFileSync(srcFile, destFile);
        }
    }
}

// ── Generate project-realms.js ───────────────────────────────────
function generateRealmsModule(projects) {
    const order = projects.map((p) => `  "${p.id}"`).join(",\n");

    const entries = projects.map((p) => {
        return `  "${p.id}": ${JSON.stringify(p, null, 4).replace(/\n/g, "\n  ")}`;
    }).join(",\n");

    return `// AUTO-GENERATED by scripts/build-projects.js — do not edit manually.

export const projectRealmOrder = [
${order}
];

export const projectRealms = {
${entries}
};

export function getProjectRealm(projectId) {
  return projectRealms[projectId] ?? projectRealms[projectRealmOrder[0]];
}

export function getProjectNeighbors(projectId) {
  const index = projectRealmOrder.indexOf(projectId);
  if (index < 0) {
    return {
      previous: projectRealms[projectRealmOrder[projectRealmOrder.length - 1]],
      next: projectRealms[projectRealmOrder[0]]
    };
  }

  const previous = projectRealms[projectRealmOrder[(index - 1 + projectRealmOrder.length) % projectRealmOrder.length]];
  const next = projectRealms[projectRealmOrder[(index + 1) % projectRealmOrder.length]];
  return { previous, next };
}
`;
}

// ── Generate a project HTML file from template ───────────────────
function generateProjectHtml(projectId, title) {
    const template = readFileSync(TEMPLATE, "utf-8");
    return template
        .replace(/\{\{PROJECT_ID\}\}/g, projectId)
        .replace(/\{\{PROJECT_TITLE\}\}/g, title);
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
    if (!existsSync(PROJECTS_DIR)) {
        console.error("❌  projects/ directory not found.");
        process.exit(1);
    }

    const allTxtFiles = readdirSync(PROJECTS_DIR)
        .filter((f) => extname(f) === ".txt" && f !== "order.txt")
        .sort();

    // ── Apply custom ordering if order.txt exists ──────────────────
    const orderPath = join(PROJECTS_DIR, "order.txt");
    let txtFiles = allTxtFiles;

    if (existsSync(orderPath)) {
        const orderList = readFileSync(orderPath, "utf-8")
            .split("\n")
            .map(l => l.trim())
            .filter(Boolean);

        txtFiles = allTxtFiles.sort((a, b) => {
            const idA = basename(a, ".txt");
            const idB = basename(b, ".txt");
            const idxA = orderList.indexOf(idA);
            const idxB = orderList.indexOf(idB);

            // If both in list, use list order
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            // If only A in list, A comes first
            if (idxA !== -1) return -1;
            // If only B in list, B comes first
            if (idxB !== -1) return 1;
            // Otherwise alphabetical
            return idA.localeCompare(idB);
        });
    }

    if (txtFiles.length === 0) {
        console.warn("⚠️  No .txt files found in projects/. Generating empty project-realms.js.");
    }

    const projects = [];

    txtFiles.forEach((file, i) => {
        const id = basename(file, ".txt");
        const filePath = join(PROJECTS_DIR, file);
        const parsed = parseTxtFile(filePath);
        const palette = PALETTES[i % PALETTES.length];
        const assets = collectAssets(id);

        const project = {
            id,
            path: `/project-${id}.html`,
            title: parsed.title || id,
            subtitle: parsed.subtitle || "",
            projectTag: "Project",
            theme: palette.theme,
            modelPath: parsed.modelPath || "",
            modelScale: 1,
            accent: palette.accent,
            secondary: palette.secondary,
            impact: "",
            stack: parsed.stack,
            metrics: parsed.metrics,
            chapters: parsed.bodies.map((b) => b.content.slice(0, 120) + (b.content.length > 120 ? "…" : "")),
            bodies: parsed.bodies,
            thumbnail: parsed.thumbnail || "",
            assets,
        };

        projects.push(project);

        // Copy assets to public
        copyAssetsToPublic(id);

        // Generate project HTML
        const html = generateProjectHtml(id, parsed.title || id);
        writeFileSync(join(ROOT, `project-${id}.html`), html);
        console.log(`  ✓ project-${id}.html`);
    });

    // Generate project-realms.js
    const module = generateRealmsModule(projects);
    writeFileSync(OUTPUT_DATA, module);
    console.log(`  ✓ src/data/project-realms.js (${projects.length} projects)`);

    // ── Handle About Section ─────────────────────────────────────
    const profileTxt = join(ABOUT_DIR, "profile.txt");
    if (existsSync(profileTxt)) {
        const aboutData = parseProfileFile(profileTxt);
        const aboutModule = `// AUTO-GENERATED by scripts/build-projects.js — do not edit manually.
export const aboutData = ${JSON.stringify(aboutData, null, 4)};
`;
        writeFileSync(OUTPUT_ABOUT, aboutModule);
        console.log(`  ✓ src/data/about-data.js`);

        // Copy profile image if it exists in about/
        if (aboutData.profileImage) {
            const srcImg = join(ABOUT_DIR, aboutData.profileImage);
            const destImgDir = join(PUBLIC_ASSETS, "profile");
            if (existsSync(srcImg)) {
                if (!existsSync(destImgDir)) mkdirSync(destImgDir, { recursive: true });
                copyFileSync(srcImg, join(destImgDir, aboutData.profileImage));
            }
        }
    }

    console.log(`\n✅  Built ${projects.length} project(s) successfully.`);
}

main();
