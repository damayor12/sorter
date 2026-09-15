import { describe, it, expect, vi } from "vitest";
import { NamesSorterApp } from "../src/NamesSorterApp.js";
import { InMemoryNameRepository } from "../src/io/NameRepository.js";
import { LastNameThenGivenNamesSorter } from "../src/sorting/PersonSorter.js";
import { parseCliArgs } from "../src/cli.js";
import { CliConfigError, FileAccessError, RuntimeFailureError, toAppError } from "../src/errors/errors.js";
import type { Printer } from "../src/io/ConsolePrinter.js";
import type { Person } from "../src/domain/Person.js";

const makePerson = (name: string): Person => {
  const parts = name.split(" ");
  return { givenNames: parts.slice(0, -1), lastName: parts[parts.length - 1] as string };
};

describe("parseCliArgs", () => {
  it("uses the expected defaults and accepts optional output and locale", () => {
    expect(parseCliArgs(["./input.txt"], {})).toEqual({
      input: "./input.txt",
      output: "sorted-names-list.txt",
      locale: "en",
    });

    expect(parseCliArgs(["./input.txt", "./out.txt", "fr"], { LOCALE: "de" })).toEqual({
      input: "./input.txt",
      output: "./out.txt",
      locale: "fr",
    });
  });

  it("rejects invalid CLI contracts", () => {
    expect(() => parseCliArgs([], {})).toThrow(/input path/i);
    expect(() => parseCliArgs(["", "./out.txt"], {})).toThrow(/input path/i);
    expect(() => parseCliArgs(["./input.txt", "./out.txt", ""], {})).toThrow(/locale/i);
    expect(() => parseCliArgs(["./input.txt", "./out.txt", "fr", "extra"], {})).toThrow(/too many/i);
  });
});

describe("error types", () => {
  it("creates explicit config and runtime error categories", () => {
    expect(() => parseCliArgs([])).toThrow(CliConfigError);
    expect(new FileAccessError("read", "/tmp/test.txt", new Error("ENOENT"))).toBeInstanceOf(FileAccessError);
    expect(new RuntimeFailureError("bad state")).toBeInstanceOf(RuntimeFailureError);
  });

  it("normalizes unknown errors into the app error hierarchy", () => {
    const normalized = toAppError(new Error("disk gone"));
    expect(normalized).toBeInstanceOf(RuntimeFailureError);
    expect(normalized.message).toBe("disk gone");

    const configError = new CliConfigError("bad config");
    expect(toAppError(configError)).toBe(configError);
  });
});

describe("NamesSorterApp", () => {
  it("sorts, writes back to the repository, and prints in order", async () => {
    const repo = new InMemoryNameRepository([
      makePerson("Janet Parsons"),
      makePerson("Olivia Chow"),
      makePerson("Vaughn Adeyemi"),
      makePerson("Marin Adeyemi"),
    ]);
    const printed: string[] = [];
    const printer: Printer = { print: (lines) => printed.push(...lines) };

    await new NamesSorterApp(repo, new LastNameThenGivenNamesSorter(), printer, repo).run();

    expect(printed).toEqual(["Marin Adeyemi", "Vaughn Adeyemi", "Olivia Chow", "Janet Parsons"]);
    const stored = await repo.readAll();
    expect(stored.map((x) => x.lastName)).toEqual(["Adeyemi", "Adeyemi", "Chow", "Parsons"]);
  });

  it("preserves order of duplicate entries while sorting", async () => {
    const repo = new InMemoryNameRepository([
      makePerson("Ava Smith"),
      makePerson("Ben Smith"),
      makePerson("Ben Smith"),
      makePerson("Chris Jones"),
    ]);
    const printed: string[] = [];

    await new NamesSorterApp(
      repo,
      new LastNameThenGivenNamesSorter(),
      { print: (lines) => printed.push(...lines) },
      repo,
    ).run();

    expect(printed).toEqual(["Chris Jones", "Ava Smith", "Ben Smith", "Ben Smith"]);
    expect((await repo.readAll()).map((person) => `${person.givenNames.join(" ")} ${person.lastName}`)).toEqual([
      "Chris Jones",
      "Ava Smith",
      "Ben Smith",
      "Ben Smith",
    ]);
  });

  it("propagates repository errors", async () => {
    const failingRepo = {
      readAll: async () => {
        throw new Error("disk error");
      },
      writeAll: async () => undefined,
    };
    await expect(
      new NamesSorterApp(
        failingRepo,
        new LastNameThenGivenNamesSorter(),
        { print: () => undefined },
        failingRepo,
      ).run(),
    ).rejects.toThrow("disk error");
  });

  it("the injected printer is fired (not the console output)", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const repo = new InMemoryNameRepository([makePerson("A B")]);
    await new NamesSorterApp(repo, new LastNameThenGivenNamesSorter(), { print: () => undefined }, repo).run();
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
