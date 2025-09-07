import { program } from "commander";

program.option("--first").option("-s, --separator <char>");

program.parse();
