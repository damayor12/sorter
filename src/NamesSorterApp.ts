import type { NameRepository } from "./io/NameRepository.js";
import type { PersonSorter } from "./sorting/PersonSorter.js";
import type { Printer } from "./io/ConsolePrinter.js";

/**
 * SorterApp Orchestration.
 */
export class NamesSorterApp {
  constructor(
    private readonly repository: NameRepository,
    private readonly sorter: PersonSorter,
    private readonly printer: Printer,
    private readonly outputRepository: NameRepository = repository,
  ) {}

  async run(): Promise<void> {
    const people = await this.repository.readAll();
    const sorted = this.sorter.sort(people);
    await this.outputRepository.writeAll(sorted);
    this.printer.print(sorted.map((p) => `${p.givenNames.join(" ")} ${p.lastName}`));
  }
}
