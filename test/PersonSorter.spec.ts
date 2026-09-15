import { describe, it, expect } from "vitest";
import { LastNameThenGivenNamesSorter } from "../src/sorting/PersonSorter.js";
import type { Person } from "../src/domain/Person.js";

const makePerson = (givenNames: string[], lastName: string): Person => ({
  givenNames,
  lastName,
});

describe("LastNameThenGivenNamesSorter", () => {
  const sorter = new LastNameThenGivenNamesSorter();

  it("sorts by last name first", () => {
    const sorted = sorter.sort([makePerson(["Janet"], "Parsons"), makePerson(["Theodore"], "Fabbes")]);
    expect(sorted.map((x) => x.lastName)).toEqual(["Fabbes", "Parsons"]);
  });

  it("sorts by given names when last names are the same", () => {
    const sorted = sorter.sort([
      makePerson(
        [" Vaughn ", "Adeyemi"].map((s) => s.trim()),
        "Adams",
      ),
      makePerson(["Marin", "Adeyemi"], "Adams"),
      makePerson(["Adeyemi"], "Adams"),
    ]);
    expect(sorted.map((x) => x.givenNames.join(" "))).toEqual(["Adeyemi", "Marin Adeyemi", "Vaughn Adeyemi"]);
  });

  it("is case-insensitive and locale-aware", () => {
    const sorted = sorter.sort([makePerson(["bob"], "SMITH"), makePerson(["Alice"], "smith")]);
    expect(sorted[0]?.givenNames).toEqual(["Alice"]);
  });

  it("does not mutate the input array", () => {
    const input = [makePerson(["Zed"], "Alpha"), makePerson(["Amy"], "Bravo")];
    sorter.sort(input);
    expect(input[0]?.givenNames).toEqual(["Zed"]);
  });

  it("places shorter given-name prefix first", () => {
    const sorted = sorter.sort([makePerson(["Mary", "Ann"], "Lee"), makePerson(["Mary"], "Lee")]);
    expect(sorted[0]?.givenNames).toEqual(["Mary"]);
  });

  it("keeps original order for equal names", () => {
    const first = makePerson(["Alex"], "Smith");
    const second = makePerson(["Alex"], "Smith");
    const input = [first, second];

    const sorted = sorter.sort(input);

    expect(sorted[0]).toBe(first);
    expect(sorted[1]).toBe(second);
  });

  it("uses the provided locale when sorting names", () => {
    const swedishSorter = new LastNameThenGivenNamesSorter("sv");
    const sorted = swedishSorter.sort([
      makePerson(["Anna"], "Östberg"),
      makePerson(["Bara"], "Zed"),
      makePerson(["Cora"], "Ångström"),
    ]);

    expect(sorted.map((person) => person.lastName)).toEqual(["Zed", "Ångström", "Östberg"]);
  });
});
