import { describe, it, expect } from "vitest";
import { genderize, getGreeting, getIntroSentence } from "@/lib/chartHelpers";

describe("genderize", () => {
  it("adapts inclusive notation to feminine", () => {
    expect(genderize("animé·e", "femme")).toBe("animée");
    expect(genderize("un·e", "femme")).toBe("une");
    expect(genderize("fait·e", "femme")).toBe("faite");
    expect(genderize("fort·e", "femme")).toBe("forte");
    expect(genderize("né·e", "femme")).toBe("née");
    expect(genderize("tisseur·se", "femme")).toBe("tisseuse");
    expect(genderize("créatif·ve", "femme")).toBe("créative");
  });

  it("strips inclusive markers for masculine", () => {
    expect(genderize("animé·e", "homme")).toBe("animé");
    expect(genderize("un·e", "homme")).toBe("un");
    expect(genderize("tisseur·se", "homme")).toBe("tisseur");
    expect(genderize("créatif·ve", "homme")).toBe("créatif");
  });

  it("keeps inclusive notation for non-binary", () => {
    expect(genderize("animé·e", "nb")).toBe("animé·e");
    expect(genderize("un·e tisseur·se", "nb")).toBe("un·e tisseur·se");
  });

  it("handles plain text without markers", () => {
    expect(genderize("bonjour", "femme")).toBe("bonjour");
    expect(genderize("bonjour", "homme")).toBe("bonjour");
  });

  it("handles multiple markers in one sentence", () => {
    expect(genderize("Tu es un·e être animé·e", "femme")).toBe("Tu es une être animée");
    expect(genderize("Tu es un·e être animé·e", "homme")).toBe("Tu es un être animé");
  });
});

describe("getGreeting", () => {
  it("returns feminine French greeting", () => {
    expect(getGreeting("Marie", "femme", "fr")).toBe("Chère Marie");
  });

  it("returns masculine French greeting", () => {
    expect(getGreeting("Pierre", "homme", "fr")).toBe("Cher Pierre");
  });

  it("returns English greeting regardless of gender", () => {
    expect(getGreeting("Alex", "femme", "en")).toBe("Dear Alex");
    expect(getGreeting("Alex", "homme", "en")).toBe("Dear Alex");
    expect(getGreeting("Alex", "nb", "en")).toBe("Dear Alex");
  });

  it("returns name only for non-binary in French", () => {
    expect(getGreeting("Sam", "nb", "fr")).toBe("Sam");
  });

  it("defaults to French when no locale provided", () => {
    expect(getGreeting("Marie", "femme")).toBe("Chère Marie");
  });
});

describe("getIntroSentence", () => {
  it("extracts the first sentence", () => {
    expect(getIntroSentence("Bonjour le monde. Voici la suite.")).toBe("Bonjour le monde.");
  });

  it("returns full text when no period", () => {
    expect(getIntroSentence("Sans point final")).toBe("Sans point final");
  });

  it("handles text with multiple sentences", () => {
    expect(getIntroSentence("Premier. Deuxième. Troisième.")).toBe("Premier.");
  });
});
