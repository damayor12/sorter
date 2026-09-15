export interface Person {
  readonly givenNames: readonly string[];
  readonly lastName: string;
}

export function formatFullName(p: Person): string {
  return `${p.givenNames.join(" ")} ${p.lastName}`;
}
