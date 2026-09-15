# Name-Sorter

Sorts full names from a text file by last name, then given names. Prints the
result to the console and writes it to a txt file.

## Usage

```sh
npm install
npm link
```

Start Project

```sh
name-sorter ./unsorted-names-list.txt
```

```sh
// optionally
name-sorter ./unsorted-names-list.txt [output-file] [locale]
```

## Tests

```sh
npm run test
```

## Assumptions

Input format: one full name per line, `Given [Middle...] Last` (1–3 given names).
Blank lines are skipped,
invalid lines (i.e with invalid number of names) are rejected.
