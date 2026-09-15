import chalk from "chalk";

export interface Printer {
  print(lines: readonly string[]): void;
}

export class ConsolePrinter implements Printer {
  print(lines: readonly string[]): void {
    lines.forEach((line) => {
      console.log(chalk.green(line));
    });
  }
}
