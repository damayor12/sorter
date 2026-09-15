import type { Person } from "../domain/Person.js";

export interface NameRepository {
  readAll(): Promise<Person[]>;
  writeAll(people: readonly Person[]): Promise<void>;
}

export class InMemoryNameRepository implements NameRepository {
  constructor(private people: Person[] = []) {}

  async readAll(): Promise<Person[]> {
    return [...this.people];
  }

  async writeAll(people: readonly Person[]): Promise<void> {
    this.people = [...people];
  }
}
