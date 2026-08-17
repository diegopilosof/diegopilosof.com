import { describe, it, expect } from "vitest";
import { anchorSlugFromId } from "./slug";

describe("anchorSlugFromId", () => {
  it("strips a YYYY-MM- date prefix", () => {
    expect(anchorSlugFromId("2026-08-cutoff")).toBe("cutoff");
  });

  it("keeps the rest of a multi-hyphen slug intact", () => {
    expect(anchorSlugFromId("2026-08-deferred-revenue-cutoff")).toBe(
      "deferred-revenue-cutoff",
    );
  });

  it("passes through an id with no date prefix", () => {
    expect(anchorSlugFromId("plain-slug")).toBe("plain-slug");
  });

  it("only strips a prefix at the start, not one embedded mid-id", () => {
    expect(anchorSlugFromId("notes-2026-08-x")).toBe("notes-2026-08-x");
  });

  it("does not strip a single-digit month (schema convention is two digits)", () => {
    expect(anchorSlugFromId("2026-8-cutoff")).toBe("2026-8-cutoff");
  });

  it("does not strip a year-only prefix", () => {
    expect(anchorSlugFromId("2026-cutoff")).toBe("2026-cutoff");
  });
});
