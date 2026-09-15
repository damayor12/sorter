import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Person } from "../domain/Person.js";
import type { NameParser } from "../domain/NameParser.js";
import { formatFullName } from "../domain/Person.js";
import { FileAccessError, NameParseError } from "../errors/errors.js";
import type { NameRepository } from "./NameRepository.js";

export class FileLineRepository implements NameRepository {
  constructor(
    private readonly filePath: string,
    private readonly parser: NameParser,
  ) {}

  async readAll(): Promise<Person[]> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return raw
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => this.parser.parse(line));
    } catch (error) {
      if (error instanceof NameParseError) {
        throw error;
      }
      throw new FileAccessError("read", this.filePath, error);
    }
  }

  async writeAll(people: readonly Person[]): Promise<void> {
    try {
      const content = people.length === 0 ? "" : `${people.map(formatFullName).join("\n")}\n`;
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(this.filePath, content, "utf8");
    } catch (error) {
      throw new FileAccessError("write", this.filePath, error);
    }
  }
}
