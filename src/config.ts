import { CliConfigError } from "./errors/errors.js";

export interface AppConfig {
  input: string;
  output: string;
  locale: string;
}

export function handleAppConfig(
  args: readonly string[] = [],
  env: Record<string, string | undefined> = process.env,
): AppConfig {
  const [input, outputArg, localeArg] = args;

  if (!input || input.trim() === "") {
    throw new CliConfigError("Input path is required. Usage: name-sorter <input-file> [output-file] [locale]");
  }

  if (args.length > 3) {
    throw new CliConfigError("Too many CLI arguments. Usage: name-sorter <input-file> [output-file] [locale]");
  }

  const output = outputArg ?? "sorted-names-list.txt";
  const locale = localeArg ?? env.LOCALE ?? "en";

  if (!locale || locale.trim() === "") {
    throw new CliConfigError("Locale cannot be empty. Provide a valid locale such as en, fr, or sv.");
  }

  return { input, output, locale };
}
