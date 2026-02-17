export const projectRealmOrder = [
  "finance-wizard",
  "enemy-ai",
  "asl-translator",
  "bastion-artifact"
];

export const projectRealms = {
  "finance-wizard": {
    id: "finance-wizard",
    path: "/project-finance-wizard.html",
    title: "Finance Wizard Mobile Port",
    subtitle:
      "A native iOS migration focused on making financial literacy feel accessible, visual, and actionable for K-12 learners.",
    projectTag: "Ledger Bloom Realm",
    theme: "ledger",
    modelPath: "",
    modelScale: 1,
    accent: "#c9a24b",
    secondary: "#35463f",
    impact: "Expanded usability through native UX patterns and mobile-first learning flows.",
    stack: ["Swift", "SwiftUI", "Firebase", "Git", "Xcode"],
    metrics: [
      { label: "Audience", value: "K-12 Learners" },
      { label: "Platform", value: "iOS Native" },
      { label: "Focus", value: "Accessibility" }
    ],
    chapters: [
      "Reframed financial education as short visual modules with reduced cognitive load.",
      "Built reusable SwiftUI components for onboarding, progress, and scenario cards.",
      "Connected account flows and product iteration loops through Firebase-backed state."
    ]
  },
  "enemy-ai": {
    id: "enemy-ai",
    path: "/project-enemy-ai.html",
    title: "Enemy AI Behavioral System",
    subtitle:
      "A gameplay intelligence stack for Unreal Engine that combines sensory logic, behavior trees, and adaptive reaction loops.",
    projectTag: "Tactical Forge Realm",
    theme: "forge",
    modelPath: "",
    modelScale: 1,
    accent: "#8f6a33",
    secondary: "#35463f",
    impact: "Improved encounter depth with enemies that react to context instead of scripted patterns.",
    stack: ["UE5", "C++", "Blueprints", "Behavior Trees", "AI Agents"],
    metrics: [
      { label: "Engine", value: "UE5" },
      { label: "Core", value: "Behavior Trees" },
      { label: "Outcome", value: "Adaptive Combat" }
    ],
    chapters: [
      "Modeled sensory channels for line-of-sight, aggression triggers, and retreat logic.",
      "Implemented behavior tree branches to make enemy intent more legible to players.",
      "Tested tuning profiles for pacing, pressure curves, and difficulty fairness."
    ]
  },
  "asl-translator": {
    id: "asl-translator",
    path: "/project-asl-translator.html",
    title: "ASL Gesture Translator",
    subtitle:
      "A webcam-to-language pipeline that translates hand landmarks into alphabet and phrase predictions using an MLP model.",
    projectTag: "Signal Mesh Realm",
    theme: "signal",
    modelPath: "",
    modelScale: 1,
    accent: "#c9a24b",
    secondary: "#8f6a33",
    impact: "Reached 97% model accuracy and ranked Top 15 in workshop final evaluations.",
    stack: ["Python", "OpenCV", "MediaPipe", "MLP", "Data Pipeline"],
    metrics: [
      { label: "Accuracy", value: "97%" },
      { label: "Rank", value: "Top 15" },
      { label: "Input", value: "Webcam Landmarks" }
    ],
    chapters: [
      "Built a robust data collection and cleaning pipeline from live camera landmarks.",
      "Trained and evaluated MLP variants for recognition confidence and latency tradeoffs.",
      "Packaged inference outputs into a practical interaction loop for communication support."
    ]
  },
  "bastion-artifact": {
    id: "bastion-artifact",
    path: "/project-bastion-artifact.html",
    title: "Bastion of the Artifact",
    subtitle:
      "A team-led Unreal prototype with combat, AI, wave systems, and inventory mechanics built under Agile delivery cycles.",
    projectTag: "Citadel Core Realm",
    theme: "citadel",
    modelPath: "",
    modelScale: 1,
    accent: "#8f6a33",
    secondary: "#35463f",
    impact: "Shipped a playable integrated prototype while coordinating a 10-person team.",
    stack: ["Unreal Engine", "C++", "Agile", "Gameplay Systems", "Enemy AI"],
    metrics: [
      { label: "Team", value: "10 Developers" },
      { label: "Method", value: "Agile SDLC" },
      { label: "Result", value: "Playable Build" }
    ],
    chapters: [
      "Led sprint planning and system ownership across combat, inventory, and wave flows.",
      "Coordinated cross-discipline handoffs between gameplay engineers and content creators.",
      "Delivered cohesive core loops with scalable architecture for future expansion."
    ]
  }
};

export function getProjectRealm(projectId) {
  return projectRealms[projectId] ?? projectRealms["finance-wizard"];
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
