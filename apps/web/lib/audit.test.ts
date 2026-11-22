import { describe, expect, it } from "vitest";
import { analyzeAudit, fixtureSnapshot, workspaces } from "./audit";

const origin = "https://roaclaw.example";
const sable = workspaces.find((workspace) => workspace.id === "sable-stem")!;
const dental = workspaces.find((workspace) => workspace.id === "morrow-dental")!;
const retail = workspaces.find((workspace) => workspace.id === "northline-retail")!;
const product = { priceUsd: 119, cta: "Add to cart" };

describe("demo audit", () => {
  it("keeps the bundled workspace scopes and uses the app-hosted demo product", () => {
    expect(workspaces.map(({ id, organizationId }) => [id, organizationId])).toEqual([
      ["sable-stem", "demo-owner-org"],
      ["northline-retail", "demo-agency-org"],
      ["morrow-dental", "demo-agency-org"],
    ]);
    expect(fixtureSnapshot(sable, origin)).toMatchObject({
      url: `${origin}/demo-store/`,
      title: "Ceramic Vase Set | Demo Store",
      headings: ["Ceramic Vase Set"],
      prices: ["$119"],
      ctas: ["Add to cart"],
      isSynthetic: true,
    });
    expect(fixtureSnapshot(dental, origin)).toMatchObject({ url: `${origin}/morrow-booking/`, prices: [], ctas: ["Contact us"] });
    expect(fixtureSnapshot(retail, origin)).toMatchObject({ url: `${origin}/northline-offer/`, prices: ["$18"], ctas: ["Add to cart"] });
  });

  it("reports the original synthetic discrepancies and keeps inference provenance", () => {
    const report = analyzeAudit(sable, fixtureSnapshot(sable, origin), product, "on_device", " Demo review. ");

    expect(report).toMatchObject({
      workspaceId: "sable-stem",
      pageSource: "on_device",
      reasoningSource: "in_cloud",
      commentary: "Demo review.",
    });
    expect(report.findings).toMatchObject([
      { id: "offer-mismatch", type: "fact", severity: "high", evidence: "Advertised $99 vs landing page $119.", sourceScope: "page_and_workspace_fixture" },
      { id: "utm-gap", type: "fact", severity: "medium", evidence: expect.stringContaining("utm_campaign"), sourceScope: "workspace_fixture" },
      { id: "roas-target-gap", type: "fact", severity: "medium", evidence: "3.315 observed ROAS vs 3.6 target (2026-11-09/2026-11-15).", sourceScope: "workspace_fixture" },
    ]);
    expect(report.findings[2].explanation).toContain("before assigning a cause");
    expect(report.priceComparison).toEqual({ campaign: 99, page: 119 });
    expect(report.proposal).toEqual({
      id: `${report.id}-bookmark`,
      title: "Ceramic Vase Set · Campaign research",
      before: `${origin}/demo-store/?utm_source=meta&utm_medium=paid_social`,
      url: `${origin}/demo-store/?utm_source=meta&utm_medium=paid_social&utm_campaign=weekend-everyday-essentials`,
    });
  });

  it("checks model prices against the selected capture and handles matching offers", () => {
    const page = fixtureSnapshot(sable, origin);
    const ungrounded = analyzeAudit(sable, page, { ...product, priceUsd: 129 }, "in_cloud");
    const ambiguous = analyzeAudit(sable, { ...page, prices: ["$119", "$129"] }, product, "on_device");
    const matching = analyzeAudit(sable, { ...page, prices: ["Sale USD 99.00."] }, { ...product, priceUsd: 99 }, "on_device");

    expect(ungrounded).toMatchObject({ pageSource: "in_cloud", reasoningSource: null, commentary: null });
    expect(ungrounded.findings[0]).toMatchObject({ id: "offer-unverified", type: "unknown" });
    expect(ambiguous.findings[0]).toMatchObject({ id: "offer-unverified", type: "unknown" });
    expect(matching.findings.map(({ id }) => id)).toEqual(["utm-gap", "roas-target-gap"]);
  });

  it("does not compare an unrelated product or propose bookmarking it", () => {
    const page = { ...fixtureSnapshot(sable, origin), isSynthetic: false, title: "Table Linen", headings: ["Table Linen"] };
    const report = analyzeAudit(sable, page, product, "on_device");

    expect(report.findings.map(({ id }) => id)).toEqual(["utm-gap", "roas-target-gap"]);
    expect(report.proposal).toBeNull();
  });

  it("only proposes a tagged bookmark for the recognized synthetic storefront", () => {
    const page = { ...fixtureSnapshot(sable, origin), isSynthetic: false, url: "https://other.example/demo-store/" };
    const report = analyzeAudit(sable, page, product, "on_device");

    expect(report.findings[0]).toMatchObject({ id: "offer-mismatch", type: "fact" });
    expect(report.proposal).toBeNull();
  });

  it("does not issue a new tag when the configured campaign already has one", () => {
    const campaign = sable.campaign!;
    const workspace = { ...sable, campaign: { ...campaign, destination: `${campaign.destination}&utm_campaign=existing` } };
    const report = analyzeAudit(workspace, fixtureSnapshot(workspace, origin), product, "on_device");

    expect(report.findings.map(({ id }) => id)).toEqual(["offer-mismatch", "roas-target-gap"]);
    expect(report.proposal).toBeNull();
  });

  it.each(["javascript:alert(1)", "https://operator:password@roaclaw.example/demo-store/", "chrome://settings"])(
    "does not surface an unsafe page URL (%s)",
    (url) => {
      const page = { ...fixtureSnapshot(sable, origin), isSynthetic: false, url };
      const report = analyzeAudit(sable, page, product, "on_device");

      expect(report.page.url).toBe("");
      expect(report.findings.map(({ id }) => id)).toEqual(["utm-gap", "roas-target-gap"]);
      expect(report.proposal).toBeNull();
    },
  );

  it("keeps the dental CTA a hypothesis and never carries findings across workspaces", () => {
    const dentalPage = fixtureSnapshot(dental, origin);
    const lead = analyzeAudit(dental, dentalPage, { priceUsd: null, cta: "Contact us" }, "on_device");
    const missing = analyzeAudit(dental, { ...dentalPage, ctas: [] }, { priceUsd: null, cta: "Contact us" }, "on_device");
    const blank = analyzeAudit(retail, fixtureSnapshot(retail, origin), product, "on_device");

    expect(lead.findings).toMatchObject([
      { id: "cta-mismatch", type: "hypothesis", evidence: expect.stringContaining("Appointment booking") },
    ]);
    expect(lead.proposal).toBeNull();
    expect(missing.findings).toEqual([]);
    expect(blank.findings).toMatchObject([{ id: "offer-unverified", type: "unknown" }]);
    expect(analyzeAudit(retail, fixtureSnapshot(retail, origin), { priceUsd: 18, cta: "Add to cart" }, "on_device").findings).toEqual([]);
  });
});
