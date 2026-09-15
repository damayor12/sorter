import chalk from "chalk";
import { CliConfigError, FileAccessError, RuntimeFailureError } from "./errors.js";

export function handleErrors(message: string, err: Error): never {
  const detail = err.stack ?? err.message;
  const outputMessage =
    err instanceof CliConfigError
      ? `${chalk.yellow.bold("CliConfigError:Invalid input")}: ${chalk.yellow(err.message)}`
      : err instanceof FileAccessError
        ? `${chalk.red.bold("FileAccessError")}: ${chalk.red(err.message)}`
        : err instanceof RuntimeFailureError
          ? `${chalk.red.bold("RuntimeFailureError")}: ${chalk.red(err.message)}`
          : `${chalk.red.bold(message)}: ${chalk.red(detail)}`;

  process.stderr.write(`${outputMessage}\n`);
  process.exit(1);
}
