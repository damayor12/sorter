import { SimpleNameParser } from "./domain/NameParser.js";
import { LastNameThenGivenNamesSorter } from "./sorting/PersonSorter.js";
import { FileLineRepository } from "./io/FileLineRepository.js";
import { ConsolePrinter } from "./io/ConsolePrinter.js";
import { NamesSorterApp } from "./NamesSorterApp.js";
import { handleAppConfig } from "./config.js";
import { toAppError } from "./errors/errors.js";
import { handleErrors } from "./errors/utils.js";

const { input, output, locale } = handleAppConfig(process.argv.slice(2));

try {
  await new NamesSorterApp(
    new FileLineRepository(input, new SimpleNameParser()),
    new LastNameThenGivenNamesSorter(locale),
    new ConsolePrinter(),
    new FileLineRepository(output, new SimpleNameParser()),
  ).run();
} catch (err) {
  handleErrors("ERROR", toAppError(err));
}
