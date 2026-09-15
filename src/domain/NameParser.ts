import type { Person } from "./Person.js";
import { NameParseError } from "../errors/errors.js";

export interface NameParser {
  parse(line: string): Person;
}

export class SimpleNameParser implements NameParser {
  private static readonly MAX_GIVEN = 3;

  parse(line: string): Person {
    const namesArr = line
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    if (namesArr.length < 2) {
      throw new NameParseError(`Expected at least a given name and a last name, got: "${line}"`, line);
    }
    if (namesArr.length > SimpleNameParser.MAX_GIVEN + 1) {
      throw new NameParseError(
        `Expected at most 3 given names plus a last name, got ${namesArr.length - 1} given names in: "${line}"`,
        line,
      );
    }
    const lastName = namesArr[namesArr.length - 1] as string;
    const givenNames = namesArr.slice(0, -1);
    return { givenNames, lastName };
  }
}
