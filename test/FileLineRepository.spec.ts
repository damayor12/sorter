import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileLineRepository } from "../src/io/FileLineRepository.js";
import { SimpleNameParser } from "../src/domain/NameParser.js";
import { NameParseError } from "../src/errors/errors.js";

describe("FileLineRepository", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "namesorter-"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("empty file returns an empty list", async () => {
    const file = join(dir, "test-in.txt");
    await writeFile(file, "");
    const repo = new FileLineRepository(file, new SimpleNameParser());
    const people = await repo.readAll();
    expect(people).toHaveLength(0);
  });

  it("reads one person per line, blank lines are skipped", async () => {
    const file = join(dir, "test-in.txt");
    await writeFile(file, "Doug Ford\n\nMarin Adeyemi\n");
    const repo = new FileLineRepository(file, new SimpleNameParser());
    const people = await repo.readAll();
    expect(people).toHaveLength(2);
    expect(people[0]?.lastName).toBe("Ford");
  });

  it("writes sorted names one per line", async () => {
    const file = join(dir, "test-out.txt");
    const repo = new FileLineRepository(file, new SimpleNameParser());
    await repo.writeAll([
      { givenNames: ["Marin"], lastName: "Adeyemi" },
      { givenNames: ["Doug"], lastName: "Ford" },
    ]);
    expect(await readFile(file, "utf8")).toBe("Marin Adeyemi\nDoug Ford\n");
  });

  it("creates parent directories on write", async () => {
    const file = join(dir, "a/b/test-out.txt");
    const repo = new FileLineRepository(file, new SimpleNameParser());
    await repo.writeAll([{ givenNames: ["A"], lastName: "B" }]);
    expect(await readFile(file, "utf8")).toBe("A B\n");
  });

  it("throws expected filesystem errors", async () => {
    const repo = new FileLineRepository(join(dir, "missing.txt"), new SimpleNameParser());
    await expect(repo.readAll()).rejects.toThrow(/ENOENT/);
  });

  it("throws expected parse errors and when a file with dirty name is parsed", async () => {
    const file = join(dir, "invalid.txt");
    await writeFile(file, "Jane Doe\nOnlyOne\n");

    const repo = new FileLineRepository(file, new SimpleNameParser());

    await expect(repo.readAll()).rejects.toThrow(NameParseError);
  });
});
