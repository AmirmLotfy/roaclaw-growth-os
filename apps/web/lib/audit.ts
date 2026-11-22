import seed from "../../../data/seed-demo.json";

export type PrivacyMode = "local" | "hybrid" | "cloud";

export type PageSnapshot = {
  url: string;
  title: string;
  headings: string[];
  prices: string[];
  ctas: string[];
  capturedAt: string;
  isSynthetic?: boolean;
};

export type Workspace = {
  id: string;
  organizationId: string;
  name: string;
  category: "ecommerce" | "lead_generation";
  currency: string;
  timezone: string;
  demoOnly: boolean;
  objective?: { metric: string; target: number; period: string };
  metricSnapshot: {
    source: "synthetic_fixture";
    period: string;
    spend: number;
    impressions?: number;
    clicks?: number;
    purchases?: number;
    attributedRevenue?: number;
    roas?: number;
    leads?: number;
    bookings?: number;
  };
  campaign?: {
    id: string;
    title: string;
    advertisedProduct: string;
    advertisedPrice: number;
    destination: string;
    source: "synthetic_fixture";
  };
  selectedProductPage?: { title: string; visibleProductPrice: number; visibleCTA: string };
  landingPage?: { visibleCTA: string; campaignGoal: string; potentialMismatch: boolean };
};

export type AuditFinding = {
  id: string;
  title: string;
  type: "fact" | "hypothesis" | "unknown";
  category: "offer_mismatch" | "tracking_gap" | "target_gap" | "cta_mismatch";
  severity: "low" | "medium" | "high";
  explanation: string;
  evidence: string;
  sourceScope: "page" | "workspace_fixture" | "page_and_workspace_fixture";
};

type InferenceSource = "on_device" | "in_cloud";

export type AuditResult = {
  id: string;
  createdAt: string;
  workspaceId: string;
  page: PageSnapshot;
  pageSource: InferenceSource;
  reasoningSource: "in_cloud" | null;
  findings: AuditFinding[];
  commentary: string | null;
  priceComparison?: { campaign: number; page: number };
  proposal: { id: string; title: string; url: string; before: string } | null;
};

export type PageExtraction = { priceUsd: number | null; cta: string | null };

const demoStorePath = "/demo-store/";

export const workspaces: Workspace[] = seed.workspaces.map((workspace) => ({
  id: workspace.id,
  organizationId: workspace.organizationId,
  name: workspace.name,
  category: workspace.category === "lead_generation" ? "lead_generation" : "ecommerce",
  currency: workspace.currency,
  timezone: workspace.timezone,
  demoOnly: workspace.demoOnly,
  objective: workspace.objective,
  metricSnapshot: { ...workspace.metricSnapshot, source: "synthetic_fixture" },
  campaign: workspace.campaign && {
    id: workspace.campaign.id,
    title: workspace.campaign.title,
    advertisedProduct: workspace.campaign.advertisedProduct,
    advertisedPrice: workspace.campaign.advertisedPrice,
    destination: `${demoStorePath}${new URL(workspace.campaign.destination).search}`,
    source: "synthetic_fixture",
  },
  selectedProductPage: workspace.selectedProductPage && {
    title: workspace.selectedProductPage.title,
    visibleProductPrice: workspace.selectedProductPage.visibleProductPrice,
    visibleCTA: workspace.selectedProductPage.visibleCTA,
  },
  landingPage: workspace.landingPage,
}));

function safeWebUrl(value: string, base?: string): URL | null {
  try {
    const url = new URL(value, base);
    if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Return only the bundled synthetic page evidence scoped to the selected workspace. */
export function fixtureSnapshot(workspace: Workspace, origin: string): PageSnapshot {
  const page = workspace.selectedProductPage;
  const safeOrigin = safeWebUrl(origin);
  const pageUrl = page && safeOrigin ? new URL(demoStorePath, safeOrigin).href : "";
  const cta = page?.visibleCTA ?? workspace.landingPage?.visibleCTA;

  return {
    url: pageUrl,
    title: page?.title ?? workspace.name,
    headings: workspace.campaign ? [workspace.campaign.advertisedProduct] : [],
    prices: page ? [usd.format(page.visibleProductPrice)] : [],
    ctas: cta ? [cta] : [],
    capturedAt: new Date().toISOString(),
    isSynthetic: true,
  };
}

function normalizeEvidence(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function extractedPriceMatchesCapture(prices: string[], price: number | null): price is number {
  if (price === null || !Number.isFinite(price) || price < 0) return false;

  const amounts = new Set<number>();
  for (const text of prices) {
    const usdAmounts = text.matchAll(/(?:\bUS\$|(?<![\p{L}])\$|\bUSD\b)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)(?!\w|[.,]\d)/giu);
    for (const match of usdAmounts) amounts.add(Number(match[1].replaceAll(",", "")));
  }
  return amounts.size === 1 && amounts.has(price);
}

function matchesProduct(page: PageSnapshot, product: string): boolean {
  const expected = normalizeEvidence(product);
  return (
    page.headings.some((heading) => normalizeEvidence(heading) === expected) ||
    page.title.split(/[|·]|\s+[-–—]\s+/).some((title) => normalizeEvidence(title) === expected)
  );
}

/** Compare model extraction with captured evidence. Provide commentary only after a confirmed cloud response. */
export function analyzeAudit(
  workspace: Workspace,
  page: PageSnapshot,
  extraction: PageExtraction,
  pageSource: InferenceSource,
  commentary?: string | null,
): AuditResult {
  const id = crypto.randomUUID();
  const pageUrl = safeWebUrl(page.url);
  const findings: AuditFinding[] = [];
  let priceComparison: AuditResult["priceComparison"];
  let proposal: AuditResult["proposal"] = null;
  const campaign = workspace.campaign;

  if (campaign) {
    const selectedProductMatches = Boolean(pageUrl || page.isSynthetic) && matchesProduct(page, campaign.advertisedProduct);
    if (selectedProductMatches) {
      const price = extraction.priceUsd;
      if (!extractedPriceMatchesCapture(page.prices, price)) {
        findings.push({
          id: "offer-unverified",
          title: "Page price could not be verified",
          type: "unknown",
          category: "offer_mismatch",
          severity: "low",
          evidence: `Campaign offer ${usd.format(campaign.advertisedPrice)}. No single confirmed USD price in the selected capture.`,
          explanation: "Confirm the current product price on the selected page before comparing it with the campaign offer.",
          sourceScope: "page_and_workspace_fixture",
        });
      } else if (price !== campaign.advertisedPrice) {
        priceComparison = { campaign: campaign.advertisedPrice, page: price };
        findings.push({
          id: "offer-mismatch",
          title: "Advertised and displayed prices differ",
          type: "fact",
          category: "offer_mismatch",
          severity: "high",
          evidence: `Advertised ${usd.format(campaign.advertisedPrice)} vs landing page ${usd.format(price)}.`,
          explanation: `Confirm which price buyers should see, then update the campaign or the page.`,
          sourceScope: "page_and_workspace_fixture",
        });
      }
    }

    const query = campaign.destination.split("?", 2)[1]?.split("#", 1)[0];
    const campaignParams = new URLSearchParams(query);
    if (!campaignParams.get("utm_campaign")?.trim()) {
      const demoDestination = page.isSynthetic && pageUrl && selectedProductMatches && pageUrl.pathname === demoStorePath
        ? safeWebUrl(campaign.destination, pageUrl.origin)
        : null;
      const usableDestination = demoDestination?.origin === pageUrl?.origin && demoDestination?.pathname === demoStorePath
        ? demoDestination
        : null;

      findings.push({
        id: "utm-gap",
        title: "Campaign destination is missing its campaign tag",
        type: "fact",
        category: "tracking_gap",
        severity: "medium",
        evidence: `The demo campaign destination has no usable utm_campaign parameter. ${usableDestination?.href ?? campaign.destination}`,
        explanation: "Add a campaign tag to identify visits from this link.",
        sourceScope: "workspace_fixture",
      });

      const campaignTag = campaign.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (usableDestination && campaignTag) {
        const before = usableDestination.href;
        usableDestination.searchParams.set("utm_campaign", campaignTag);
        proposal = {
          id: `${id}-bookmark`,
          title: `${campaign.advertisedProduct} · Campaign research`,
          url: usableDestination.href,
          before,
        };
      }
    }
  }

  const { objective, metricSnapshot, landingPage } = workspace;
  if (objective?.metric === "roas" && metricSnapshot.roas !== undefined &&
      metricSnapshot.period === objective.period && metricSnapshot.roas < objective.target) {
    findings.push({
      id: "roas-target-gap",
      title: "Demo ROAS is below target",
      type: "fact",
      category: "target_gap",
      severity: "medium",
      evidence: `${metricSnapshot.roas} observed ROAS vs ${objective.target} target (${objective.period}).`,
      explanation: "Check attribution and conversion data before assigning a cause.",
      sourceScope: "workspace_fixture",
    });
  }

  const cta = extraction.cta?.trim();
  if (landingPage?.potentialMismatch && page.isSynthetic && cta &&
      normalizeEvidence(cta) === normalizeEvidence(landingPage.visibleCTA) &&
      page.ctas.some((label) => normalizeEvidence(label) === normalizeEvidence(cta))) {
    findings.push({
      id: "cta-mismatch",
      title: "The CTA may obscure the booking goal",
      type: "hypothesis",
      category: "cta_mismatch",
      severity: "medium",
      evidence: `The landing-page fixture lists “${cta}”. The campaign goal is “${landingPage.campaignGoal}”.`,
      explanation: "Review where the CTA leads and check the booking funnel before drawing conclusions about conversions.",
      sourceScope: "page_and_workspace_fixture",
    });
  }

  const confirmedCommentary = commentary?.trim() || null;
  return {
    id,
    createdAt: new Date().toISOString(),
    workspaceId: workspace.id,
    page: { ...page, url: pageUrl?.href ?? "" },
    pageSource,
    reasoningSource: confirmedCommentary ? "in_cloud" : null,
    findings,
    ...(priceComparison && { priceComparison }),
    commentary: confirmedCommentary,
    proposal,
  };
}
