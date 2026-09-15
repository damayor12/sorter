import type { Person } from "../domain/Person.js";

export interface PersonSorter {
  sort(people: readonly Person[]): Person[];
}

/**
 * Sorts by last name using case-insensitive, locale-aware comparison (default english),then by given names from left to right. In exact ties, original order is kept as is. Order is also preserved with duplicates.
 */
export class LastNameThenGivenNamesSorter implements PersonSorter {
  private readonly collator: Intl.Collator;

  constructor(locale = "en" as Intl.LocalesArgument) {
    this.collator = new Intl.Collator(locale, { sensitivity: "base" });
  }

  sort(people: readonly Person[]): Person[] {
    return [...people].sort((left, right) => this.comparePeople(left, right));
  }

  private comparePeople(left: Person, right: Person): number {
    const byLastName = this.collator.compare(left.lastName, right.lastName);
    if (byLastName !== 0) return byLastName;

    return this.compareGivenNames(left, right);
  }

  private compareGivenNames(left: Person, right: Person): number {
    const minGivenNamesLength = Math.min(left.givenNames.length, right.givenNames.length);

    for (let index = 0; index < minGivenNamesLength; index++) {
      const result = this.collator.compare(left.givenNames[index] as string, right.givenNames[index] as string);

      if (result !== 0) return result;
    }

    return left.givenNames.length - right.givenNames.length;
  }
}
