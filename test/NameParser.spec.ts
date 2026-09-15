import { describe, it, expect } from "vitest";
import { SimpleNameParser } from "../src/domain/NameParser.js";
import { NameParseError } from "../src/errors/errors.js";

describe("SimpleNameParser", () => {
  const parser = new SimpleNameParser();

  it("successfully parses names array with 2 names", () => {
    expect(parser.parse("Janet Parsons")).toEqual({
      givenNames: ["Janet"],
      lastName: "Parsons",
    });
  });

  it("successfully parses three given names plus surname", () => {
    expect(parser.parse("Ab Bc Gh De")).toEqual({
      givenNames: ["Ab", "Bc", "Gh"],
      lastName: "De",
    });
  });

  it("removes and trims extra whitespace", () => {
    expect(parser.parse("  Marin   Adeyemi  ")).toEqual({
      givenNames: ["Marin"],
      lastName: "Adeyemi",
    });
  });

  it("rejects a single name", () => {
    expect(() => parser.parse("Cher")).toThrow(NameParseError);
  });

  it.each([2, 3, 4])("successfully parses total of given names between 1 and 3", (n) => {
    expect(() => parser.parse("ABC ".repeat(n))).not.toThrow(NameParseError);
  });

  it.each([5, 6, 7, 8, 9, 10])("rejects more than %i given names", (n) => {
    expect(() => parser.parse("ABC ".repeat(n))).toThrow(NameParseError);
  });

  it("rejects empty lines", () => {
    expect(() => parser.parse("   ")).toThrow(NameParseError);
  });

  it("dirty input to throw specific error and save that to input property", () => {
    try {
      expect(() => parser.parse("oops")).toThrow(/Expected at least a given name and a last name/);

      parser.parse("justonename");
    } catch (e) {
      expect((e as NameParseError).input).toBe("justonename");
    }
  });
});
