export const fps = 30;
export const chapterFrames = 36;
export const outroFrames = 120;
export const maxFrames = 180 * fps;

export const beats = {
  home: {
    label: "Product website",
    title: "Open the Growth Audit",
    caption: "Open a demo and choose ecommerce, lead generation, or an agency client.",
  },
  history: {
    label: "Chrome companion · Recent history",
    title: "Find a recently visited page",
    caption: "With permission, the side panel searches recent public pages in Chrome.",
  },
  lead: {
    label: "Morrow Dental · Lead generation demo",
    title: "Check the appointment goal",
    caption: "The booking audit marks the Contact us button as a hypothesis to review.",
  },
  offer: {
    label: "Synthetic storefront",
    title: "Compare the campaign and page prices",
    caption: "The demo campaign advertises $99. The product page shows $119.",
  },
  device: {
    label: "Firebase AI Logic · On device",
    title: "Extract page evidence on device",
    caption: "Gemini Nano 4 extracts the visible price and button label in Chrome.",
  },
  cloud: {
    label: "Firebase AI Logic · In cloud",
    title: "Review the findings in the cloud",
    caption: "A cloud Gemini model reviews the audit findings.",
  },
  findings: {
    label: "Sable & Stem · Synthetic campaign",
    title: "Inspect the audit findings",
    caption: "The audit flags a price mismatch, a missing campaign tag, and ROAS below target.",
    chapter: "Audit findings",
  },
  workspaces: {
    label: "Workspace context",
    title: "Switch workspaces",
    caption: "The dashboard loads metrics and audit history for the selected workspace.",
  },
  review: {
    label: "Review before approving",
    title: "Review the proposed URL",
    caption: "The proposed URL adds utm_campaign and keeps the existing tracking tags.",
    chapter: "Review the proposed URL",
  },
  capture: {
    label: "Chrome companion",
    title: "Capture the selected page",
    caption: "The Chrome side panel captures page evidence when the operator asks.",
  },
  bookmark: {
    label: "Chrome companion · Verified receipt",
    title: "Save and verify a bookmark",
    caption: "After approval, Chrome saves the tagged bookmark and reads it back.",
    chapter: "Verify the bookmark",
  },
  receipt: {
    label: "Growth Audit · Verified action",
    title: "Check the saved receipt",
    caption: "The audit stores the verified bookmark receipt in the active workspace.",
  },
  followup: {
    label: "Scheduled follow-up",
    title: "Schedule a price recheck",
    caption: "Run a due follow-up to check what price the storefront shows now.",
  },
};
